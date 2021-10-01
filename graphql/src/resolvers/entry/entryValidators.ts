import { ObjectId } from "mongodb";
import { UserInputError } from "apollo-server-errors";

import { AccountingDb } from "../../dataSources/accountingDb/accountingDb";
import { PaymentMethodDBRecord } from "../../dataSources/accountingDb/types";
import { categoryType } from "../category/categoryResolver";
import {
  EntityType,
  EntryType,
  NewEntry,
  NewEntryRefund,
  ReconcileEntries,
  UpdateEntry,
  UpdateEntryDateOfRecord,
  UpdateEntryRefund,
  UpsertEntrySource,
} from "../../graphTypes";
import { validatePerson } from "../person";
import { validateBusiness } from "../business";
import { validateDepartment } from "../department";
import { startOfDay } from "date-fns";
import { validateCategory } from "../category";
import Fraction from "fraction.js";
import {
  upsertPaymentMethodToDbRecord,
  validatePaymentMethod,
} from "../paymentMethod";
import { result } from "lodash";

export const validateEntry = new (class {
  async exists({
    entry,
    accountingDb,
  }: {
    entry: ObjectId;
    accountingDb: AccountingDb;
  }) {
    if (
      !(await accountingDb.findOne({
        collection: "entries",
        filter: {
          _id: entry,
        },
        options: {
          projection: {
            _id: true,
          },
        },
      }))
    ) {
      throw new UserInputError(
        `"Entry" id "${entry.toHexString()} does not exists`
      );
    }
  }
  async refundExists({
    refund,
    accountingDb,
  }: {
    refund: ObjectId;
    accountingDb: AccountingDb;
  }) {
    if (
      !(await accountingDb.findOne({
        collection: "entries",
        filter: {
          "refunds.id": refund,
        },
        options: {
          projection: {
            _id: true,
          },
        },
      }))
    ) {
      throw new UserInputError(
        `"EntryRefund" id "${refund.toHexString()} does not exists`
      );
    }
  }
  async entryCategoryPayMethod(
    args: {
      accountingDb: AccountingDb;
    } & (
      | {
          category: ObjectId;
          paymentMethod: PaymentMethodDBRecord;
        }
      | {
          entry: ObjectId;
          category: ObjectId;
        }
      | {
          entry: ObjectId;
          paymentMethod: PaymentMethodDBRecord;
        }
    )
  ) {
    const { paymentMethod, category, accountingDb } = await (async () => {
      if (!("entry" in args)) {
        return { ...args };
      } else if ("category" in args) {
        return {
          ...args,
          paymentMethod: await args.accountingDb
            .findOne({
              collection: "entries",
              filter: {
                _id: args.entry,
              },
              options: {
                projection: {
                  paymentMethod: true,
                },
              },
            })
            .then(({ paymentMethod: [{ value }] }) => value),
        };
      } else {
        return {
          ...args,
          category: await args.accountingDb
            .findOne({
              collection: "entries",
              filter: {
                _id: args.entry,
              },
              options: {
                projection: {
                  category: true,
                },
              },
            })
            .then(({ category: [{ value }] }) => value),
        };
      }
    })();

    const entryType = await categoryType({
      category,
      accountingDb,
    });

    switch (paymentMethod.type) {
      // Valid for all entryTypes
      case "Cash":
      case "Combination":
      case "Online":
      case "Unknown":
        break;
      // Type dependent
      case "Check":
        {
          const isAccountCheck = !!paymentMethod.check.account;

          if (entryType === "Credit") {
            if (isAccountCheck) {
              // Cannot receive money with an AccountCheck
              throw new UserInputError(
                `Entry "Category" of type "${EntryType.Credit}" and payment method "AccountCheck" are incompatible.`
              );
            }
          } else if (!isAccountCheck) {
            // Cannot give money with an PaymentCheck
            throw new UserInputError(
              `Entry "Category" of type "${EntryType.Debit}" and payment method "PaymentCheck" are incompatible.`
            );
          }
        }

        break;
      case "Card": {
        const isAccountCard = paymentMethod.card instanceof ObjectId;

        if (entryType === "Credit") {
          if (isAccountCard) {
            // Cannot be receive money on an AccountCard
            throw new UserInputError(
              `Entry "Category" of type "${EntryType.Credit}" and payment method "AccountCard" are incompatible.`
            );
          }
        } else if (!isAccountCard) {
          // Cannot be give money on an PaymentCard
          throw new UserInputError(
            `Entry "Category" of type "${EntryType.Debit}" and payment method "PaymentCard" are incompatible.`
          );
        }
      }
    }
  }
  async entryRefundCategoryPayMethod({
    entry,
    paymentMethod,
    accountingDb,
  }: {
    entry: ObjectId;
    paymentMethod: PaymentMethodDBRecord;
    accountingDb: AccountingDb;
  }) {
    switch (paymentMethod.type) {
      // Valid for all entryTypes
      case "Cash":
      case "Combination":
      case "Online":
      case "Unknown":
        return;
      default:
        break;
    }

    const entryType = await categoryType({
      category: await accountingDb
        .findOne({
          collection: "entries",
          filter: {
            _id: entry,
          },
          options: {
            projection: {
              category: true,
            },
          },
        })
        .then(({ category: [{ value }] }) => value),
      accountingDb,
    });

    switch (paymentMethod.type) {
      case "Card":
        {
          const isAccountCard = paymentMethod.card instanceof ObjectId;

          if (entryType === "Credit") {
            if (isAccountCard) {
              // Cannot give a refund from a AccountCard
              throw new UserInputError(
                `A refund with entry "Category" of type "${EntryType.Credit}" and payment method "AccountCard" are incompatible.`
              );
            }
          } else if (!isAccountCard) {
            // Cannot receive a refund from a PaymentCard
            throw new UserInputError(
              `A refund with entry "Category" of type "${EntryType.Debit}" and payment method "PaymentCard" are incompatible.`
            );
          }
        }
        break;
      case "Check":
        {
          const isAccountCheck = !!paymentMethod.check.account;

          if (entryType === "Credit") {
            if (!isAccountCheck) {
              // Cannot give a refund with an PaymentCheck.
              throw new UserInputError(
                `A refund with entry "Category" of type "${EntryType.Credit}" and payment method "PaymentCheck" are incompatible.`
              );
            }
          } else if (isAccountCheck) {
            // Cannot receive a refund with an AccountCheck
            throw new UserInputError(
              `A refund with entry "Category" of type "${EntryType.Debit}" and payment method "AccountCheck" are incompatible.`
            );
          }
        }
        break;
    }
  }
  async upsertEntrySource({
    upsertEntrySource,
    accountingDb,
  }: {
    accountingDb: AccountingDb;
    upsertEntrySource: UpsertEntrySource;
  }) {
    const [field, ...restFields] = Object.keys(
      upsertEntrySource
    ) as (keyof UpsertEntrySource)[];

    if (!field) {
      throw new UserInputError(`"UpsertEntrySource" requires one field."`);
    } else if (restFields.length) {
      throw new UserInputError(
        `"UpsertEntrySource.${field}" is mutually exclusive to  ${restFields
          .map((field) => `"UpsertEntrySource.${field}"`)
          .join(", ")}.`
      );
    }

    switch (field) {
      case "business":
        validateBusiness.newBusiness({
          newBusiness: upsertEntrySource.business,
        });
        break;
      case "person":
        await validatePerson.newPerson({ newPerson: upsertEntrySource.person });
        break;
      case "source":
        {
          const id = new ObjectId(upsertEntrySource.source.id);
          switch (upsertEntrySource.source.type) {
            case EntityType.Business:
              await validateBusiness.exists({ business: id, accountingDb });
              break;
            case EntityType.Department:
              await validateDepartment.exists({ department: id, accountingDb });
              break;
            case EntityType.Person:
              await validatePerson.exists({ person: id, accountingDb });
              break;
          }
        }
        break;
    }
  }
  upsertEntryDate({
    newEntryDate,
    reqDateTime,
  }: {
    newEntryDate: Date;
    reqDateTime: Date;
  }) {
    if (startOfDay(newEntryDate) > startOfDay(reqDateTime)) {
      throw new UserInputError(`Entry date cannot be in the future.`);
    }
  }
  upsertEntryTotal({ total }: { total: Fraction }) {
    if (total.compare(0) < 1) {
      throw new UserInputError(`Entry total must be greater than zero.`);
    }
  }
  async upsertEntryRefundTotal({
    entry,
    total: newTotal,
    refund: refundId,
    accountingDb,
  }: {
    entry: ObjectId;
    total: Fraction;
    refund?: ObjectId;
    accountingDb: AccountingDb;
  }) {
    if (newTotal.compare(0) < 1) {
      throw new UserInputError(`Entry refund total must be greater than zero.`);
    }

    const {
      refunds,
      total: [{ value: total }],
    } = await accountingDb.findOne({
      collection: "entries",
      filter: { _id: entry },
      options: {
        projection: {
          "total.value": true,
          "refunds.id": true,
          "refunds.total.value": true,
          "refunds.deleted.value": true,
        },
      },
    });

    let remaining = new Fraction(total).sub(newTotal);
    const lessThanZero = (amount: Fraction) => {
      if (remaining.compare(0) < 0) {
        throw new UserInputError(`Refunds cannot exceed entry total.`);
      }
    };
    lessThanZero(remaining);
    for (const {
      id,
      total: [{ value: refund }],
      deleted: [{ value: deleted }],
    } of refunds || []) {
      if (!deleted && (!refundId || !id.equals(refundId))) {
        lessThanZero((remaining = remaining.sub(new Fraction(refund))));
      }
    }
  }
  async newEntry({
    newEntry,
    accountingDb,
    reqDateTime,
  }: {
    accountingDb: AccountingDb;
    reqDateTime: Date;
    newEntry: NewEntry;
  }) {
    const categoryId = new ObjectId(newEntry.category);

    await Promise.all([
      // date
      this.upsertEntryDate({ newEntryDate: newEntry.date, reqDateTime }),
      // department
      validateDepartment.exists({
        department: new ObjectId(newEntry.department),
        accountingDb,
      }),
      // category
      validateCategory.exists({
        category: categoryId,
        accountingDb,
      }),
      validateCategory.isNotRoot({
        category: categoryId,
        accountingDb,
      }),
      // paymentMethod
      (async () => {
        await validatePaymentMethod.upsertPaymentMethod({
          upsertPaymentMethod: newEntry.paymentMethod,
          accountingDb,
        });
        await this.entryCategoryPayMethod({
          accountingDb,
          category: categoryId,
          paymentMethod: upsertPaymentMethodToDbRecord({
            upsertPaymentMethod: newEntry.paymentMethod,
          }),
        });
      })(),
      // total
      this.upsertEntryTotal({ total: newEntry.total }),
      // Source
      this.upsertEntrySource({
        upsertEntrySource: newEntry.source,
        accountingDb,
      }),
    ]);
  }
  async updateEntry({
    updateEntry,
    accountingDb,
    reqDateTime,
  }: {
    accountingDb: AccountingDb;
    reqDateTime: Date;
    updateEntry: UpdateEntry;
  }) {
    // Must be the id + some field update
    if (Object.keys(updateEntry).length < 2) {
      throw new UserInputError("Nothing to update.");
    }

    const entry = new ObjectId(updateEntry.id);

    // entry
    await this.exists({
      entry: entry,
      accountingDb,
    });

    await Promise.all([
      // date
      updateEntry.date &&
        this.upsertEntryDate({
          newEntryDate: updateEntry.date,
          reqDateTime,
        }),
      // dateOfRecord
      updateEntry.dateOfRecord &&
        this.updateEntryDateOfRecord({
          updateEntryDateOfRecord: updateEntry.dateOfRecord,
        }),
      // department
      updateEntry.department &&
        validateDepartment.exists({
          department: new ObjectId(updateEntry.department),
          accountingDb,
        }),
      // category and paymentMethod
      (async () => {
        const categoryId =
          updateEntry.category && new ObjectId(updateEntry.category);

        if (categoryId && updateEntry.paymentMethod) {
          await Promise.all([
            validateCategory.exists({
              category: categoryId,
              accountingDb,
            }),
            validateCategory.isNotRoot({
              category: categoryId,
              accountingDb,
            }),
            validatePaymentMethod.upsertPaymentMethod({
              upsertPaymentMethod: updateEntry.paymentMethod,
              accountingDb,
            }),
          ]);

          await this.entryCategoryPayMethod({
            accountingDb,
            category: categoryId,
            paymentMethod: upsertPaymentMethodToDbRecord({
              upsertPaymentMethod: updateEntry.paymentMethod,
            }),
          });
        } else if (categoryId) {
          await Promise.all([
            validateCategory.exists({
              category: categoryId,
              accountingDb,
            }),
            validateCategory.isNotRoot({
              category: categoryId,
              accountingDb,
            }),
          ]);
          await this.entryCategoryPayMethod({
            accountingDb,
            category: categoryId,
            entry,
          });
        } else if (updateEntry.paymentMethod) {
          await validatePaymentMethod.upsertPaymentMethod({
            upsertPaymentMethod: updateEntry.paymentMethod,
            accountingDb,
          });

          await this.entryCategoryPayMethod({
            accountingDb,
            entry,
            paymentMethod: upsertPaymentMethodToDbRecord({
              upsertPaymentMethod: updateEntry.paymentMethod,
            }),
          });
        }
      })(),
      // total
      updateEntry.total && this.upsertEntryTotal({ total: updateEntry.total }),
      // Source
      updateEntry.source &&
        this.upsertEntrySource({
          upsertEntrySource: updateEntry.source,
          accountingDb,
        }),
    ]);
  }
  updateEntryDateOfRecord({
    updateEntryDateOfRecord,
  }: {
    updateEntryDateOfRecord: UpdateEntryDateOfRecord;
  }) {
    const fields = Object.keys(updateEntryDateOfRecord);
    const numFields = fields.length;

    if (!numFields) {
      throw new UserInputError(
        `"UpdateEntryDateOfRecord" requires at least one field.`
      );
    } else if (numFields > 1 && "clear" in updateEntryDateOfRecord) {
      throw new UserInputError(
        `"UpdateEntryDateOfRecord.clear" is mutually exclusive to ${fields
          .filter((field) => field !== "clear")
          .map((field) => `"UpdateEntryDateOfRecord.${field}"`)
          .join(", ")}.`
      );
    }
  }
  async newEntryRefund({
    newEntryRefund,
    accountingDb,
    reqDateTime,
  }: {
    accountingDb: AccountingDb;
    reqDateTime: Date;
    newEntryRefund: NewEntryRefund;
  }) {
    const entry = new ObjectId(newEntryRefund.entry);

    await this.exists({
      accountingDb,
      entry: entry,
    });

    await Promise.all([
      // date
      this.upsertEntryDate({
        newEntryDate: newEntryRefund.date,
        reqDateTime,
      }),
      // paymentMethod
      (async () => {
        await validatePaymentMethod.upsertPaymentMethod({
          upsertPaymentMethod: newEntryRefund.paymentMethod,
          accountingDb,
        });
        await this.entryRefundCategoryPayMethod({
          accountingDb,
          paymentMethod: upsertPaymentMethodToDbRecord({
            upsertPaymentMethod: newEntryRefund.paymentMethod,
          }),
          entry,
        });
      })(),
      // total
      this.upsertEntryRefundTotal({
        total: newEntryRefund.total,
        entry,
        accountingDb,
      }),
    ]);
  }

  async updateEntryRefund({
    accountingDb,
    reqDateTime,
    updateEntryRefund,
  }: {
    accountingDb: AccountingDb;
    reqDateTime: Date;
    updateEntryRefund: UpdateEntryRefund;
  }) {
    // Must be the id + some field update
    if (Object.keys(updateEntryRefund).length < 2) {
      throw new UserInputError("Nothing to update.");
    }

    const refundId = new ObjectId(updateEntryRefund.id);

    await this.refundExists({
      refund: refundId,
      accountingDb,
    });

    await Promise.all([
      // Date
      updateEntryRefund.date &&
        this.upsertEntryDate({
          newEntryDate: updateEntryRefund.date,
          reqDateTime,
        }),
      // paymentMethod
      updateEntryRefund.paymentMethod &&
        (async () => {
          await validatePaymentMethod.upsertPaymentMethod({
            upsertPaymentMethod: updateEntryRefund.paymentMethod,
            accountingDb,
          });
          await this.entryRefundCategoryPayMethod({
            accountingDb,
            paymentMethod: upsertPaymentMethodToDbRecord({
              upsertPaymentMethod: updateEntryRefund.paymentMethod,
            }),
            entry: (
              await accountingDb.findOne({
                collection: "entries",
                filter: {
                  "refunds.id": refundId,
                },
                options: {
                  projection: {
                    _id: true,
                  },
                },
              })
            )._id,
          });
        })(),
      updateEntryRefund.total &&
        this.upsertEntryRefundTotal({
          total: updateEntryRefund.total,
          refund: refundId,
          entry: (
            await accountingDb.findOne({
              collection: "entries",
              filter: {
                "refunds.id": refundId,
              },
              options: {
                projection: {
                  _id: true,
                },
              },
            })
          )._id,
          accountingDb,
        }),
    ]);
  }

  async reconcileEntries({
    reconcileEntries,
    accountingDb,
  }: {
    accountingDb: AccountingDb;
    reconcileEntries: ReconcileEntries;
  }) {
    if (
      !reconcileEntries.entries?.length &&
      !reconcileEntries?.refunds?.length
    ) {
      throw new UserInputError("No entries or refunds to update.");
    }

    await Promise.all([
      ...(reconcileEntries.entries || []).map((entry) =>
        (async () => {
          const id = new ObjectId(entry);

          await this.exists({
            entry: id,
            accountingDb,
          });

          const {
            reconciled: [{ value }],
          } = await accountingDb.findOne({
            collection: "entries",
            filter: { _id: id },
            options: {
              projection: {
                "reconciled.value": true,
              },
            },
          });

          if (value) {
            throw new UserInputError(
              `Entry id "${entry}" is already reconciled.`
            );
          }
        })()
      ),
      ...(reconcileEntries.refunds || []).map((refund) =>
        (async () => {
          const id = new ObjectId(refund);

          await this.refundExists({
            refund: id,
            accountingDb,
          });

          const { refunds } = await accountingDb.findOne({
            collection: "entries",
            filter: { "refunds.id": id },
            options: {
              projection: {
                "refunds.id": true,
                "refunds.reconciled": true,
              },
            },
          });

          if (
            refunds.find(({ id: refundId }) => refundId.equals(id))
              .reconciled[0].value
          ) {
            throw new UserInputError(
              `Refund id "${refund}" is already reconciled.`
            );
          }
        })()
      ),
    ]);
  }
})();

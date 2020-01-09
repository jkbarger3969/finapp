import {useCallback, useMemo} from "react";
import {useApolloClient, useQuery} from "@apollo/react-hooks";
import {O} from "ts-toolbelt";
import mergeWith from "lodash.mergewith";

import {LC_JOURNAL_ENTRY_UPSERTS, LC_JOURNAL_ENTRY_UPSERT_FRAGMENT,
  ADD_JOURNAL_ENTRY, UPDATE_JOURNAL_ENTRY, JournalEntryUpsertFragment,
  JournalEntryUpserts
} from "./JournalEntryUpsert.gql";
import {Lc_JournalEntryUpsertSubmitStatus, JournalEntrySourceType, Rational,
  Lc_JournalEntryUpsertSource, Lc_JournalEntryUpsertType, JournalEntryAddFields,
  JournalEntryUpdateFields, JournalEntrySourceInput,
  Lc_JournalEntryUpsert_1Fragment as Lc_JournalEntryUpsertFragment,
  AddJournalEntry_1Mutation as AddJournalEntry,
  AddJournalEntry_1MutationVariables as AddJournalEntryVars
} from "../../apollo/graphTypes";

export type JournalEntryUpsertWrite = 
  O.Optional<Lc_JournalEntryUpsertFragment,
    keyof Lc_JournalEntryUpsertFragment, "deep">;

export interface UpsertPayload<Ttype extends Lc_JournalEntryUpsertType> {
  type:Ttype,
  id:Ttype extends Lc_JournalEntryUpsertType.Add ? undefined : string;
  fields:Ttype extends Lc_JournalEntryUpsertType.Add 
    ? JournalEntryAddFields : JournalEntryUpdateFields;
}

type JournalEntryUpsertFragmentCancel = {
  [K in Exclude<keyof JournalEntryUpsertFragment, "id" | "__typename">]:null
} & Pick<JournalEntryUpsertFragment, "id" | "__typename">

const getUpsert = (entryUpsertId:string, 
  upserts:JournalEntryUpserts['lc_journalEntryUpserts']) => 
{
  for(const upsert of upserts) {
    if(upsert.id === entryUpsertId) {
      return upsert.submitStatus ? upsert : null;
    }
  }
  return null;
}

const useJournalEntryUpsert = function(entryUpsertId:string)
{
  
  const client = useApolloClient();
  
  const {loading, error, data} = 
    useQuery<JournalEntryUpserts>(LC_JOURNAL_ENTRY_UPSERTS);

  const lc_journalEntryUpserts = data?.lc_journalEntryUpserts || [];
  const upsert = getUpsert(entryUpsertId, lc_journalEntryUpserts);  

  const create = useCallback(
    (entryId:string | null = null)=>
  {
    
    const data = client.readQuery<JournalEntryUpserts>({
      query:LC_JOURNAL_ENTRY_UPSERTS
    });
    const lc_journalEntryUpserts = data?.lc_journalEntryUpserts || [];
    const upsert = getUpsert(entryUpsertId, lc_journalEntryUpserts);

    if(upsert){
      return upsert;
    }

    const newUpsert:JournalEntryUpsertFragment = {
      __typename:"LC_JournalEntryUpsert",
      id:entryUpsertId,
      valid:false,
      type:entryId ? 
        Lc_JournalEntryUpsertType.Update : Lc_JournalEntryUpsertType.Add,
      submitStatus:Lc_JournalEntryUpsertSubmitStatus.NotSubmitted,
      submitError:null,
      fields: {
        id:entryId,
        date:null,
        department:[],
        type:null,
        paymentMethod:null,
        total:null,
        source:[],
      },
      inputValues: {
        deptInput:null,
        totalInput:null,
        srcInput:null,
        srcType:null
      },
      inputErrors: {
        dateError:null,
        deptError:null,
        typeError:null,
        payMethodError:null,
        totalError:null,
        srcError:null
      }
    };
    
    client.writeQuery<JournalEntryUpserts>({
      query:LC_JOURNAL_ENTRY_UPSERTS,
      data:{
        ...data,
        lc_journalEntryUpserts:[
          ...(lc_journalEntryUpserts || []),
          newUpsert
        ]
      }
    });

    return newUpsert;

  },[entryUpsertId, client]);
  
  const clear = useCallback(()=>{
    
    const data = client.readQuery<JournalEntryUpserts>({
      query:LC_JOURNAL_ENTRY_UPSERTS
    });
    const prevUpserts = data?.lc_journalEntryUpserts || [];
    const upsert = getUpsert(entryUpsertId, prevUpserts);

    if(!upsert) {
      return;
    }

    client.writeQuery<JournalEntryUpserts>({
      query:LC_JOURNAL_ENTRY_UPSERTS,
      data:{
        ...data,
        lc_journalEntryUpserts:[
          ...prevUpserts.filter((upsert) => upsert.id !== entryUpsertId)
        ]
      }
    });

    client.writeFragment<JournalEntryUpsertFragmentCancel>({
      id:`LC_JournalEntryUpsert:${entryUpsertId}`,
      fragment:LC_JOURNAL_ENTRY_UPSERT_FRAGMENT,
      data:{
        ...upsert,
        valid:null,
        type:null,
        submitStatus:null,
        submitError:null,
        fields:null,
        inputValues:null,
        inputErrors:null
      }
    });

    return true;

  },[entryUpsertId, client]);

  const update = useMemo(()=>{
    
    const id =`LC_JournalEntryUpsert:${entryUpsertId}`;

    const debounceQueue:[boolean, (data:JournalEntryUpsertFragment)
      =>JournalEntryUpsertFragment, (success:boolean)=>void][] = [];
    let debounceId:ReturnType<typeof setTimeout> | null  = null;

    const writeEntryUpsertBeta = (writeFn:(
      upsert:JournalEntryUpsertFragment)=>JournalEntryUpsertFragment,
        onlyOnNotSubmitted = true) => 
    {

      if(debounceId === null) {

        // set debounceId
        debounceId = setTimeout(() => {

          // reset debounceId
          debounceId = null;

          const data = client.readQuery<JournalEntryUpserts>({
            query:LC_JOURNAL_ENTRY_UPSERTS
          });
          const lc_journalEntryUpserts = data?.lc_journalEntryUpserts || 
            [];
          const prevUpsert = getUpsert(entryUpsertId, lc_journalEntryUpserts);

          if(!prevUpsert || prevUpsert.submitStatus === null) {

            for(const [,,resolve] of debounceQueue) {
              resolve(false);
            }
            debounceQueue.splice(0);
            return;

          }

          let upsert = prevUpsert;

          for(const [onlyOnNotSubmitted, writeFn, resolve] of debounceQueue) {

            if(onlyOnNotSubmitted && upsert?.submitStatus !== 
                Lc_JournalEntryUpsertSubmitStatus.NotSubmitted)
            {
              resolve(false);
              continue;
            }

            const newData = writeFn(upsert);
            if(newData === upsert) {
             
              resolve(false);
            
            } else {
            
              upsert = newData;
              resolve(true);
            
            }

          }

          // Reset debounceQueue
          debounceQueue.splice(0);

          if(upsert !== prevUpsert) {

            client.writeFragment<JournalEntryUpsertFragment>({
              id,
              fragment:LC_JOURNAL_ENTRY_UPSERT_FRAGMENT,
              data:upsert
            });

          }

        },0);

      }

      let resolve:(success:boolean)=>void;
      const promise = new Promise<boolean>((r)=> resolve = r);

      debounceQueue.push([
        onlyOnNotSubmitted,
        writeFn,
        (success:boolean)=>resolve(success)
      ]);

      return promise;

    }

    return {
      submitStatus:(submitStatus:Lc_JournalEntryUpsertSubmitStatus) =>
        writeEntryUpsertBeta((upsert)=>({
          ...upsert,
          submitStatus
      }), false),
      submitError:(submitError:string) =>
        writeEntryUpsertBeta((upsert)=>({
          ...upsert,
          submitError
      }), false),
      inputValues: {
        deptInput:(deptInput:string | null) =>
          writeEntryUpsertBeta((upsert)=>({
            ...upsert,
            inputValues: {
              ...upsert.inputValues,
              deptInput
            }
        }), true),
        totalInput:(totalInput:string | null) =>
          writeEntryUpsertBeta((upsert)=>({
            ...upsert,
            inputValues: {
              ...upsert.inputValues,
              totalInput
            }
        }), true),
        srcInput:(srcInput:string | null) =>
          writeEntryUpsertBeta((upsert)=>({
            ...upsert,
            inputValues: {
              ...upsert.inputValues,
              srcInput
            }
        }), true),
        srcType:(srcType:JournalEntrySourceType | null) =>
          writeEntryUpsertBeta((upsert)=>({
            ...upsert,
            inputValues: {
              ...upsert.inputValues,
              srcType
            }
        }), true),
      },
      inputErrors: {
        dateError:(dateError:string | null) =>
          writeEntryUpsertBeta((upsert)=>({
            ...upsert,
            inputErrors: {
              ...upsert.inputErrors,
              dateError
            }
        }), false),
        deptError:(deptError:string | null) =>
          writeEntryUpsertBeta((upsert)=>({
            ...upsert,
            inputErrors: {
              ...upsert.inputErrors,
              deptError
            }
        }), false),
        typeError:(typeError:string | null) =>
          writeEntryUpsertBeta((upsert)=>({
            ...upsert,
            inputErrors: {
              ...upsert.inputErrors,
              typeError
            }
        }), false),
        payMethodError:(payMethodError:string | null) =>
          writeEntryUpsertBeta((upsert)=>({
            ...upsert,
            inputErrors: {
              ...upsert.inputErrors,
              payMethodError
            }
        }), false),
        totalError:(totalError:string | null) =>
          writeEntryUpsertBeta((upsert)=>({
            ...upsert,
            inputErrors: {
              ...upsert.inputErrors,
              totalError
            }
        }), false),
        srcError:(srcError:string | null) =>
          writeEntryUpsertBeta((upsert)=>({
            ...upsert,
            inputErrors: {
              ...upsert.inputErrors,
              srcError
            }
        }), false),
      },
      fields: {
        // id
        date:(date:string | null) =>
          writeEntryUpsertBeta((upsert)=>({
            ...upsert,
            fields: {
              ...upsert.fields,
              date
            }
        }), true),
        addDepartment:(department:string) =>
          writeEntryUpsertBeta((upsert)=>({
            ...upsert,
            fields: {
              ...upsert.fields,
              department:[
                ...upsert.fields.department,
                department
              ]
            }
        }), true),
        removeDepartment:(department:string) => writeEntryUpsertBeta((upsert)=>{

          const {fields} = upsert;
          const curDept = [...fields.department];

          const removeIndex = curDept.indexOf(department);

          if(removeIndex === -1) {
            return upsert;
          }

          curDept.splice(removeIndex, 1);

          return {
            ...upsert,
            fields: {
              ...fields,
              department:curDept
            }
          };

        }, true),
        replaceDepartments:(departments:string[]) =>
          writeEntryUpsertBeta((upsert)=>({
            ...upsert,
            fields: {
              ...upsert.fields,
              department:[...departments]
            }
        }), true),
        clearDepartments:() =>
          writeEntryUpsertBeta((upsert)=>({
            ...upsert,
            fields: {
              ...upsert.fields,
              department:[]
            }
        }), true),
        type:(type:string | null) =>
          writeEntryUpsertBeta((upsert)=>({
            ...upsert,
            fields: {
              ...upsert.fields,
              type
            }
        }), true),
        paymentMethod:(paymentMethod:string | null) =>
          writeEntryUpsertBeta((upsert)=>({
            ...upsert,
            fields: {
              ...upsert.fields,
              paymentMethod
            }
        }), true),
        total:(total:Rational | null) =>
          writeEntryUpsertBeta((upsert)=>({
            ...upsert,
            fields: {
              ...upsert.fields,
              total
            }
        }), true),
        addSource:(source:Lc_JournalEntryUpsertSource) =>
          writeEntryUpsertBeta((upsert)=>({
            ...upsert,
            fields: {
              ...upsert.fields,
              source:[
                ...upsert.fields.source,
                source
              ]
            }
        }), true),
        removeSource:(source:Lc_JournalEntryUpsertSource) => 
          writeEntryUpsertBeta((upsert)=>
        {

          const {fields} = upsert;
          const curSrc = [...fields.source];          
          
          let removeIndex = -1;
          for(let i = 0, len = curSrc.length; i < len; i++) {
            
            const src = curSrc[i];
            
            if(src.id === source.id && src.sourceType === source.sourceType) {
            
              removeIndex = i;
              break;
            
            }

          }

          if(removeIndex === -1) {
            return upsert;
          }

          curSrc.splice(removeIndex, 1);

          return {
            ...upsert,
            fields: {
              ...fields,
              source:curSrc
            }
          };

        }, true),
        replaceSources:(sources:Lc_JournalEntryUpsertSource[]) =>
          writeEntryUpsertBeta((upsert)=>({
            ...upsert,
            fields: {
              ...upsert.fields,
              source:[...sources]
            }
        }), true),
        clearSources:() =>
          writeEntryUpsertBeta((upsert)=>({
            ...upsert,
            fields: {
              ...upsert.fields,
              source:[]
            }
        }), true)
      }
    };

  },[entryUpsertId, client]);

  const refetchUpsert = useCallback(()=>{

    const data = client.readQuery<JournalEntryUpserts>({
      query:LC_JOURNAL_ENTRY_UPSERTS
    });
    
    const lc_journalEntryUpserts = data?.lc_journalEntryUpserts || [];
    
    return getUpsert(entryUpsertId, lc_journalEntryUpserts);

  },[entryUpsertId, client]);

  const write = useCallback((upsert:JournalEntryUpsertWrite, 
    arrays:"concat" | "replace", onlyOnNotSubmitted:boolean)=>{

    const curUpsert = refetchUpsert();
    
    if(!curUpsert || (onlyOnNotSubmitted && curUpsert.submitStatus
      !== Lc_JournalEntryUpsertSubmitStatus.NotSubmitted))
    {
      return false;
    }
    
    const id =`LC_JournalEntryUpsert:${entryUpsertId}`;
    
    const data = mergeWith({},curUpsert, upsert, (objValue, srcValue) => {
      if(!Array.isArray(srcValue) || !Array.isArray(objValue)) {
        return;
      } else if(arrays === "concat") {
        return [...objValue, ...srcValue];
      }
      return srcValue;
    });

    client.writeFragment<Lc_JournalEntryUpsertFragment>({
      id,
      fragment:LC_JOURNAL_ENTRY_UPSERT_FRAGMENT,
      data
    });

    return true;

  },[refetchUpsert, client, entryUpsertId]);

  const submit = useCallback(async () => {

    const data = client.readQuery<JournalEntryUpserts>({
      query:LC_JOURNAL_ENTRY_UPSERTS
    });
    const lc_journalEntryUpserts = data?.lc_journalEntryUpserts || [];
    const upsert = getUpsert(entryUpsertId, lc_journalEntryUpserts);

    // No active upsert 
    if(!upsert ||  
      upsert.submitStatus !== Lc_JournalEntryUpsertSubmitStatus.NotSubmitted)
    {
      return false;
    }

    const {fields, inputValues} = upsert;

    // Add new Journal Entry
    if(upsert.type === Lc_JournalEntryUpsertType.Update) {
      
      // Check required fields
      let errors = false;
      if(!(fields.date)) {
        errors = true;
        update.inputErrors.dateError("Date required.");
      }

      if(!(fields.department)) {
        errors = true;
        update.inputErrors.deptError("Department required.");
      }

      if(!(fields.type)) {
        errors = true;
        update.inputErrors.typeError("Type required.");
      }

      if(!(fields.source.length === 0 && !inputValues?.srcInput?.trim())) {
        errors = true;
        update.inputErrors.typeError("Source required.");
      }
      
      if(!(fields.paymentMethod)) {
        errors = true;
        update.inputErrors.payMethodError("Payment Method required.");
      }

      if(!(fields.total)) {
        errors = true;
        update.inputErrors.totalError("Total required.");
      // Also Validate
      } else if((fields.total.num/fields.total.den) === 0){
        errors = true;
        update.inputErrors.totalError("Must be greater than $0.");
      }

      if(errors) {
        return false;
      }
      // Set submit status
      update.submitStatus(Lc_JournalEntryUpsertSubmitStatus.Submitting);

      const date = fields.date as NonNullable<typeof fields.date>;
      const department = fields.department[fields.department.length - 1];
      const type = fields.type as NonNullable<typeof fields.type>;
      const paymentMethod = 
        fields.paymentMethod as NonNullable<typeof fields.paymentMethod>;
      const total = fields.total as NonNullable<typeof fields.total>;
      const source = await (async () => {

        if(fields.source.length > 0) {
          
          const src = fields.source[fields.source.length - 1];
          return {
            sourceType:src.sourceType,
            id:src.id
          } as JournalEntrySourceInput;
        
        // Add Person
        } else if(inputValues.srcType === JournalEntrySourceType.Person) {
          
          // TODO: implement add person
  
        // Add Business
        } else {
  
          // TODO: implement add business
  
        }
      
      })();

      try {
        
        await client.mutate<AddJournalEntry, AddJournalEntryVars>({
          mutation:ADD_JOURNAL_ENTRY,
          variables:{
            fields :{
              date,
              department,
              type,
              paymentMethod,
              total,
              source:source as JournalEntrySourceInput
            }
          }
        });
        
        // Clear upsert state after successful mutation
        clear();

        return true;
      
      } catch(error) {
      
        update.submitError(error?.message || `${error}`);
        update.submitStatus(Lc_JournalEntryUpsertSubmitStatus.NotSubmitted);
        return false;
      
      }

    // Update current Journal Entry
    } else {

      const updateFields:JournalEntryUpdateFields = {}; 
      const id = fields.id as NonNullable<typeof fields.id>;

      if(fields.date) {
        updateFields.date = fields.date;
      }

      if(fields.department.length > 0) {
        updateFields.department = 
          fields.department[fields.department.length -1];
      }

      if(fields.type) {
        updateFields.type = fields.type;
      }

      if(fields.paymentMethod) {
        updateFields.paymentMethod = fields.paymentMethod;
      }
      
      if(fields.source.length > 0) {
        const src = fields.source[fields.source.length - 1];
        updateFields.source = {
          sourceType:src.sourceType,
          id:src.id
        } as JournalEntrySourceInput;
      } else if(inputValues?.srcInput?.trim()) {

        // Add Person
        if(inputValues.srcType === JournalEntrySourceType.Person) {
            
          // TODO: implement add person

        // Add Business
        } else {

          // TODO: implement add business

        }

      }

    }

  },[entryUpsertId, client, update, clear]);

  //Allow for future state on "cancel"
  const cancel = clear;

  return {create, write, update, cancel, loading, error, upsert, 
    refetchUpsert, submit} as const;

}

export default useJournalEntryUpsert;
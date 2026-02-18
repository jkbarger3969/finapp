import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/accounting";

// Active cards with their labels - keyed by last 4 digits
const ACTIVE_CARDS: Record<string, string> = {
  "6334": "3 Cross",
  "1114": "Adult",
  "2193": "Arena",
  "7963": "Brad",
  "8567": "Connect",
  "0627": "Creative",
  "1540": "Darla",
  "1667": "General",
  "0632": "Kids",
  "4687": "Floater 1",
  "6494": "Floater 2",
  "3078": "Pastoral",
  "0080": "Randy",
  "5956": "Students",
};

async function updatePaymentCardLabels() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db();
    const paymentCardsCollection = db.collection("paymentCards");

    // Get all cards
    const allCards = await paymentCardsCollection.find({}).toArray();
    console.log(`Found ${allCards.length} total payment cards`);

    let updatedCount = 0;
    let activeCount = 0;
    let inactiveCount = 0;

    for (const card of allCards) {
      const trailingDigits = card.trailingDigits;
      const isActiveCard = trailingDigits in ACTIVE_CARDS;
      const label = ACTIVE_CARDS[trailingDigits] || null;

      // Update the card with label and active status
      const updateResult = await paymentCardsCollection.updateOne(
        { _id: card._id },
        {
          $set: {
            label: label,
            active: isActiveCard,
          },
        }
      );

      if (updateResult.modifiedCount > 0) {
        updatedCount++;
        if (isActiveCard) {
          activeCount++;
          console.log(`✓ Updated card *${trailingDigits} - Label: "${label}", Active: true`);
        } else {
          inactiveCount++;
          console.log(`○ Updated card *${trailingDigits} - Active: false`);
        }
      }
    }

    console.log("\n=== Summary ===");
    console.log(`Total cards: ${allCards.length}`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Active cards: ${activeCount}`);
    console.log(`Inactive cards: ${inactiveCount}`);

    // Verify active cards
    const activeCards = await paymentCardsCollection.find({ active: true }).toArray();
    console.log("\n=== Active Cards ===");
    activeCards.forEach((card) => {
      console.log(`*${card.trailingDigits} - ${card.label || "No Label"}`);
    });

  } catch (error) {
    console.error("Error updating payment cards:", error);
    throw error;
  } finally {
    await client.close();
    console.log("\nDisconnected from MongoDB");
  }
}

updatePaymentCardLabels();

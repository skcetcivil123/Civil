"""
Seeds MongoDB Atlas with empirical research data:
- 16 TQM Factors (8 CSFs + 8 Barriers)
- 10 Coimbatore FDM Experts
- 120 Survey Responses
- System Users
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import get_settings
from app.database import collections as col
from app.database.repository import SEED_FACTORS, SEED_EXPERTS, SEED_RESPONSES, MemoryStore

settings = get_settings()

def sanitize_doc(obj):
    if isinstance(obj, dict):
        return {str(k): sanitize_doc(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_doc(v) for v in obj]
    elif hasattr(obj, "item"): # numpy scalar
        return obj.item()
    return obj

async def seed_mongodb():
    print(f"Connecting to MongoDB Atlas: {settings.mongodb_db_name}...")
    client = AsyncIOMotorClient(settings.mongodb_uri)
    db = client[settings.mongodb_db_name]

    # 1. Factors
    existing_factors = await db[col.FACTORS].count_documents({})
    if existing_factors == 0:
        docs = [sanitize_doc(dict(f)) for f in SEED_FACTORS]
        for d in docs:
            d["_id"] = d["id"]
        await db[col.FACTORS].insert_many(docs)
        print(f"✅ Inserted {len(docs)} factors into '{col.FACTORS}'.")
    else:
        print(f"ℹ️ Collection '{col.FACTORS}' already has {existing_factors} documents.")

    # 2. Experts
    existing_experts = await db[col.EXPERTS].count_documents({})
    if existing_experts == 0:
        docs = [sanitize_doc(dict(e)) for e in SEED_EXPERTS]
        for d in docs:
            d["_id"] = d["id"]
        await db[col.EXPERTS].insert_many(docs)
        print(f"✅ Inserted {len(docs)} experts into '{col.EXPERTS}'.")
    else:
        print(f"ℹ️ Collection '{col.EXPERTS}' already has {existing_experts} documents.")

    # 3. Responses - fix index if present
    try:
        await db[col.RESPONSES].drop_index("respondent_id_1_questionnaire_id_1")
        print("Dropped old non-sparse index on responses.")
    except Exception:
        pass

    existing_responses = await db[col.RESPONSES].count_documents({})
    if existing_responses < 120:
        await db[col.RESPONSES].delete_many({}) # clear partial
        docs = [sanitize_doc(dict(r)) for r in SEED_RESPONSES]
        for d in docs:
            d["_id"] = d["id"]
            d["respondent_id"] = d["id"]
            d["questionnaire_id"] = "q_tqm_coimbatore_2026"
        await db[col.RESPONSES].insert_many(docs)
        print(f"✅ Inserted {len(docs)} responses into '{col.RESPONSES}'.")
    else:
        print(f"ℹ️ Collection '{col.RESPONSES}' already has {existing_responses} documents.")

    # 4. Users
    existing_users = await db[col.USERS].count_documents({})
    if existing_users == 0:
        mem = MemoryStore()
        docs = [sanitize_doc(dict(u)) for u in mem.users.values()]
        for d in docs:
            d["_id"] = d["id"]
        await db[col.USERS].insert_many(docs)
        print(f"✅ Inserted {len(docs)} users into '{col.USERS}'.")
    else:
        print(f"ℹ️ Collection '{col.USERS}' already has {existing_users} documents.")

    print("\n🎉 MongoDB Atlas seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_mongodb())

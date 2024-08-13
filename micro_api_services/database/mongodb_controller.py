class MongoDBHandler(DatabaseHandler):
    def __init__(self, uri, database):
        self.uri = uri
        self.database = database

    def connect(self):
        self.client = MongoClient(self.uri)
        self.db = self.client[self.database]

    def create(self, collection, data):
        return self.db[collection].insert_one(data).inserted_id

    def read(self, collection, query=None):
        if query is None:
            query = {}
        return list(self.db[collection].find(query))

    def update(self, collection, query, data):
        return self.db[collection].update_many(query, {"$set": data}).modified_count

    def delete(self, collection, query):
        return self.db[collection].delete_many(query).deleted_count

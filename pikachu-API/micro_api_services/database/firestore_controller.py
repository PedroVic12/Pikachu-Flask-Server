class FirestoreHandler(DatabaseHandler):
    def __init__(self):
        self.db = firestore.Client()

    def connect(self):
        # Firestore uses implicit connections through the Google Cloud SDK
        pass

    def create(self, collection, data):
        doc_ref = self.db.collection(collection).document()
        doc_ref.set(data)

    def read(self, collection, query=None):
        if query:
            query_ref = self.db.collection(collection)
            for key, value in query.items():
                query_ref = query_ref.where(key, "==", value)
            return [doc.to_dict() for doc in query_ref.stream()]
        else:
            return [doc.to_dict() for doc in self.db.collection(collection).stream()]

    def update(self, collection, query, data):
        query_ref = self.db.collection(collection)
        for key, value in query.items():
            query_ref = query_ref.where(key, "==", value)
        docs = query_ref.stream()
        for doc in docs:
            doc.reference.update(data)

    def delete(self, collection, query):
        query_ref = self.db.collection(collection)
        for key, value in query.items():
            query_ref = query_ref.where(key, "==", value)
        docs = query_ref.stream()
        for doc in docs:
            doc.reference.delete()

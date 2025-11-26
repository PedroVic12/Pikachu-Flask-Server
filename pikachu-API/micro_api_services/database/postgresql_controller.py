class PostgreSQLHandler(DatabaseHandler):
    def __init__(self, dbname, user, password, host, port):
        self.dbname = dbname
        self.user = user
        self.password = password
        self.host = host
        self.port = port

    def connect(self):
        self.conn = psycopg2.connect(
            dbname=self.dbname, 
            user=self.user, 
            password=self.password, 
            host=self.host, 
            port=self.port
        )
        self.cursor = self.conn.cursor()

    def create(self, table, data):
        placeholders = ', '.join(['%s'] * len(data))
        columns = ', '.join(data.keys())
        sql = f"INSERT INTO {table} ({columns}) VALUES ({placeholders})"
        self.cursor.execute(sql, list(data.values()))
        self.conn.commit()

    def read(self, table, query=None):
        sql = f"SELECT * FROM {table}"
        if query:
            sql += " WHERE " + ' AND '.join([f"{k}='{v}'" for k, v in query.items()])
        self.cursor.execute(sql)
        return self.cursor.fetchall()

    def update(self, table, query, data):
        set_clause = ', '.join([f"{k}='{v}'" for k, v in data.items()])
        where_clause = ' AND '.join([f"{k}='{v}'" for k, v in query.items()])
        sql = f"UPDATE {table} SET {set_clause} WHERE {where_clause}"
        self.cursor.execute(sql)
        self.conn.commit()

    def delete(self, table, query):
        where_clause = ' AND '.join([f"{k}='{v}'" for k, v in query.items()])
        sql = f"DELETE FROM {table} WHERE {where_clause}"
        self.cursor.execute(sql)
        self.conn.commit()

import sqlite3


class DatabaseHandler:
    def connect(self):
        raise NotImplementedError

    def create(self, table, data):
        raise NotImplementedError

    def read(self, table, query):
        raise NotImplementedError

    def update(self, table, query, data):
        raise NotImplementedError

    def delete(self, table, query):
        raise NotImplementedError

        

class SqliteControlelr:
    def __init_(self):
        pass


    def connect(self):
        self.conn = sqlite3.connect(self.database)
        self.cursor = self.conn.cursor()

    def create(self, table, data):
        placeholders = ', '.join(['?'] * len(data))
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


    def get_db_connection(self):
        conn = sqlite3.connect('database.db')
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self):
        conn = get_db_connection()
        conn.execute('''
            CREATE TABLE IF NOT EXISTS players (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                position TEXT NOT NULL
            )
        ''')
        conn.commit()
        conn.close()

banco = SqliteControlelr
banco.init_db()


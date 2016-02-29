#CMD=`meteor mongo -U pdbpdb.meteor.com | tail -1 | sed 's_mongodb://\([a-z0-9\-]*\):\([a-f0-9\-]*\)@\(.*\)/\(.*\)_mongorestore -u \1 -p \2 -h \3 -d \4_'`

import pymysql.cursors
import subprocess
from pymongo import MongoClient
from pprint import pprint

#client = MongoClient('mongodb://127.0.0.1:3001/meteor')
connstr = subprocess.Popen("meteor mongo --url pdbpdb.meteor.com", shell=True, stdout=subprocess.PIPE).stdout.read().rstrip()
client = MongoClient(connstr)
user,password = connstr[10:].split("@")[0].split(":")
print user,password

#client.meteor.authenticate(user,password)

#client.meteor.showCollections()

def transactions():
    collection = client.meteor['Transactions']
    def processMySQLRecord(recs):
        record = recs[0]
        doc = {}
        doc['number'] = record['SerNr']
        doc['_sync'] = 1
        doc['description'] = record['Comment']
        doc['amount'] = record['Amount']
        doc['currency'] = record['Currency']
        doc['user'] = record['User']
        doc['date'] = record['TransDate'].strftime("%Y-%m-%d")
        doc['apartment'] = record['Apartment']
        if not doc['apartment']: doc['apartment'] = ''
        doc['accounts'] = []
        for row in recs:
            docrow = {}
            docrow['user'] = row['Account']
            docrow['percent'] = row['Percent']
            docrow['amount'] = row['rr.Amount']
            doc['accounts'].append(docrow)
        collection.insert(doc)
    # Connect to the database
    connection = pymysql.connect(host='104.196.41.0',
                                 user='apartments',
                                 password='apartments6565',
                                 db='apartments',
                                 charset='utf8mb4',
                                 cursorclass=pymysql.cursors.DictCursor)

    try:
        with connection.cursor() as cursor:
            # Read a single record
            sql = "SELECT * from ApTrans r "
            sql += "LEFT JOIN ApTransAccountRow rr on rr.masterId = r.internalId "
            #sql += "WHERE r.TransDate >= '2016-02-15'"
            sql += "ORDER BY r.internalId, rr.rowNr"
            cursor.execute(sql)
            id = None
            recs = []
            for record in cursor:
                if record['internalId'] == id or id is None:
                    recs.append(record)
                else:
                    processMySQLRecord(recs)
                    recs = []
                    recs.append(record)
                id = record['internalId']
            if recs:
                processMySQLRecord(recs)
                recs = []



    finally:
        connection.close()

def apartments():
    collection = client.meteor['Apartments']
    def processMySQLRecord(recs):
        record = recs[0]
        doc = {}
        doc['code'] = record['Code']
        doc['_sync'] = 1
        doc['address'] = record['Address']
        doc['administration_percent'] = record['AdministrationPercent']
        doc['accounts'] = []
        for row in recs:
            docrow = {}
            docrow['user'] = row['Account']
            docrow['percent'] = row['Percent']
            doc['accounts'].append(docrow)
        collection.insert(doc)
    # Connect to the database
    connection = pymysql.connect(host='104.196.41.0',
                                 user='apartments',
                                 password='apartments6565',
                                 db='apartments',
                                 charset='utf8mb4',
                                 cursorclass=pymysql.cursors.DictCursor)

    try:
        with connection.cursor() as cursor:
            # Read a single record
            sql = "SELECT * from Apartment r "
            sql += "LEFT JOIN ApartmentAccountRow rr on rr.masterId = r.internalId "
            #sql += "WHERE r.TransDate >= '2016-02-15'"
            sql += "ORDER BY r.internalId, rr.rowNr"
            cursor.execute(sql)
            id = None
            recs = []
            for record in cursor:
                if record['internalId'] == id or id is None:
                    recs.append(record)
                else:
                    processMySQLRecord(recs)
                    recs = []
                    recs.append(record)
                id = record['internalId']
            if recs:
                processMySQLRecord(recs)
                recs = []
    finally:
        connection.close()

if __name__ == "__main__":
    #transactions()
    apartments()
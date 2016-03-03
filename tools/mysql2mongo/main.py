#CMD=`meteor mongo -U pdbpdb.meteor.com | tail -1 | sed 's_mongodb://\([a-z0-9\-]*\):\([a-f0-9\-]*\)@\(.*\)/\(.*\)_mongorestore -u \1 -p \2 -h \3 -d \4_'`
#CMD=`meteor mongo -U pdbpdb.meteor.com | tail -1 | sed 's_mongodb://\([a-z0-9\-]*\):\([a-f0-9\-]*\)@\(.*\)/\(.*\)_mongo -u \1 -p \2 -h \3 -d \4_'`
import pymysql.cursors
import subprocess
from pymongo import MongoClient
from pprint import pprint
import SimpleHTTPServer
import SocketServer
import json

client = None
db = None
k = 0
def connecToMongo():
    global client
    global db
    #client = MongoClient('mongodb://127.0.0.1:3001/meteor')
    connstr = subprocess.Popen("meteor mongo --url pdbpdb.meteor.com", shell=True, stdout=subprocess.PIPE).stdout.read().rstrip()
    client = MongoClient(connstr)
    db = client[connstr[connstr.rfind("/")+1:]]
    user,password = connstr[10:].split("@")[0].split(":")
    print user,password,db

def testConnection():
    global client
    print db
    print db['Transactions'].find({}).count()
    lastdoc = db['Transactions'].find({}).sort("record.number", -1).limit(1)
    pprint(lastdoc[0])
#client.meteor.authenticate(user,password)

#client.meteor.showCollections()

def transactions():
    global k
    k = 0
    collection = db['Transactions']
    def processMySQLRecord(recs):
        global k
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
        res = collection.update({"number": doc['number']}, doc, upsert = True)
        k += 1
        print doc['number'], k

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
    global k
    k = 0
    collection = db['Apartments']
    def processMySQLRecord(recs):
        global k
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
        res = collection.update({"code": doc['code']}, doc, upsert=True)
        k += 1
        print res,k
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


class WebHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):


    def do_POST(self):
        collection = db['Histories']
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        data_string = self.rfile.read(int(self.headers['Content-Length']))
        doc = json.loads(data_string)
        d = collection.update({"record.number": doc['record']['number'], "timestamp": doc['timestamp'], "collection": doc['collection']}, doc, upsert=True)
        print doc['timestamp']
        self.wfile.write("ok")

def serve():
    PORT = 8000

    httpd = SocketServer.TCPServer(("", PORT), WebHandler)

    print "serving at port", PORT
    httpd.serve_forever()


if __name__ == "__main__":
    connecToMongo()
    #testConnection()
    #transactions()
    #apartments()
    serve()
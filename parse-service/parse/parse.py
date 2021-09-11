from flask import Flask, request, jsonify
import json
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)

@app.route("/parse_sgx", methods=["GET"])
def parse_sgx():
    array = []
    df = pd.read_excel('../sgx.xlsx')
    dfdict = df.to_dict('records')

    for i in dfdict:
        i['Settlement_price'] = str(i['PRICE']/1000)
        string_trade_date = str(i['TRADE_DATE'])
        i['Execution_Date'] = int(string_trade_date[4:]+string_trade_date[2:4]+string_trade_date[0:2])
        i['Quantity'] = str(i['QTY'])
        i['Owner'] = 'SGX'
        i['Status'] = 'pending'
        i['Block_ID'] = 'NIL'
        array.append(i)
        
    to_return = json.dumps(array)
    return to_return

@app.route("/parse_sgx_batch", methods=["GET"])
def parse_sgx_batch():
    array = []
    df = pd.read_excel('../sgx.xlsx')
    dfdict = df.to_dict('records')

    for i in dfdict:
        i['Settlement_price'] = str(i['PRICE']/1000)
        string_trade_date = str(i['TRADE_DATE'])
        i['Execution_Date'] = int(string_trade_date[4:]+string_trade_date[2:4]+string_trade_date[0:2])
        i['Quantity'] = str(i['QTY'])
        i['Owner'] = 'SGX'
        i['Status'] = 'pending'
        i['Block_ID'] = 'NIL'
        array.append(i)

    n=2000

    output=[array[i:i + n] for i in range(0, len(array), n)]
        
    to_return = json.dumps(output)
    return to_return
    
@app.route("/parse_primo", methods=["GET"])
def parse_primo():
    array = []
    df = pd.read_excel('../primo.xlsx')
    dfdict = df.to_dict('records')

    for i in dfdict:
        i['RT'] = i['BUY_SELL']
        i['ISIN'] = i['REUT'][1:]
        i['Quantity'] = i['QUANTITY']
        i['Alpha_status'] = i['STATUS']
        i['Settlement_Price'] = i['SETTLEMENT_PRICE']
        i['Execution_Date'] = i['EXECUTION_DATE']
        i['CLINO'] = i['ACCOUNT']
        i['Owner'] = 'Primo'
        i['Status'] = 'pending'
        i['Block_ID'] = 'NIL'
        array.append(i)
        
    to_return = json.dumps(array)
    return to_return

@app.route("/parse_primo_batch", methods=["GET"])
def parse_primo_batch():
    array = []
    df = pd.read_excel('../primo.xlsx')
    dfdict = df.to_dict('records')

    for i in dfdict:
        i['RT'] = i['BUY_SELL']
        i['ISIN'] = i['REUT'][1:]
        i['Quantity'] = i['QUANTITY']
        i['Alpha_status'] = i['STATUS']
        i['Settlement_Price'] = i['SETTLEMENT_PRICE']
        i['Execution_Date'] = i['EXECUTION_DATE']
        i['CLINO'] = i['ACCOUNT']
        i['Owner'] = 'Primo'
        i['Status'] = 'pending'
        i['Block_ID'] = 'NIL'
        array.append(i)
        
    to_return = json.dumps(array)

    n=4000

    output=[array[i:i + n] for i in range(0, len(array), n)]
        
    to_return = json.dumps(output)
    
    return to_return

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=2001, debug=True)
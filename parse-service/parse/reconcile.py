from flask import Flask, request, jsonify
import json
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/reconcile", methods=["GET"])
def reconcile():
    sgx = json.loads(requests.get('http://localhost:3000/read_sgx').content)
    primo = json.loads(requests.get('http://localhost:3000/read_primo').content)


    parsed_sgx = []
    parsed_primo = []

    for i in sgx:
        if i['Record']['Status']=='pending':
            parsed_sgx.append(i)

    ISIN_list = []

    for j in parsed_sgx:
        if j['Record']['ISIN'] not in ISIN_list:
            ISIN_list.append(j['Record']['ISIN'])

    includes = False

    for k in primo: 
        if k['Record']['Status'] == 'pending':    
            for ISIN in ISIN_list:
                # parsed_primo.append(k['REUT'])
                if ISIN in k['Record']['ISIN']:
                   
                    includes = True
                    k['Record']['ISIN'] = ISIN
                    parsed_primo.append(k)
                    break

            if(includes==True):
                includes=False
            else:
                parsed_primo.append(k)

    sgx_dict = {}
    primo_dict = {}
    
    for i in parsed_sgx:
        elements = [i['Record']['ISIN'],i['Record']['RT'],i['Record']['CLINO'],i['Record']['Settlement_price'],i['Record']['Execution_Date']]
        if tuple(elements) in sgx_dict:
            sgx_dict[tuple(elements)]['Quantity'] += int(i['Record']['Quantity'])
            sgx_dict[tuple(elements)]['ID_list'].append(i['Record']['ID'])
        else:
            sgx_dict[tuple(elements)] = {'Quantity':int(i['Record']['Quantity']),'ID_list':[i['Record']['ID']]}

    for i in parsed_primo:
        elements = [i['Record']['ISIN'],i['Record']['RT'],i['Record']['CLINO'],str(i['Record']['Settlement_price']),i['Record']['Execution_Date']]
        if tuple(elements) in primo_dict:
            primo_dict[tuple(elements)]['Quantity'] += int(i['Record']['Quantity'])
            primo_dict[tuple(elements)]['ID_list'].append(i['Record']['ID'])
        else:
            primo_dict[tuple(elements)] = {'Quantity':int(i['Record']['Quantity']),'ID_list':[i['Record']['ID']]}

    failed_sgx = []
    failed_primo = []
    reconciled_sgx = []
    reconciled_primo = []

    for key, value in sgx_dict.items():
        if key not in primo_dict:
            empty_dict = {}
            empty_dict[key] = json.dumps(value)
            failed_sgx.append(empty_dict)
            continue
        
        if key in primo_dict and primo_dict[key]['Quantity']!=sgx_dict[key]['Quantity']:
            empty_dict = {}
            empty_dict[key] = json.dumps(value)
            failed_sgx.append(empty_dict)
            continue

        empty_dict = {}
        empty_dict[key] = json.dumps(value)
        reconciled_sgx.append(empty_dict)

    for key, value in primo_dict.items():
        if key not in sgx_dict:
            empty_dict = {}
            empty_dict[key] = json.dumps(value)
            failed_primo.append(empty_dict)
            continue
        
        if key in sgx_dict and sgx_dict[key]['Quantity']!=primo_dict[key]['Quantity']:
            empty_dict = {}
            empty_dict[key] = json.dumps(value)
            failed_primo.append(empty_dict)
            continue

        empty_dict = {}
        empty_dict[key] = json.dumps(value)
        reconciled_primo.append(empty_dict)

    return str({'failed_sgx':failed_sgx,'failed_primo':failed_primo,'reconciled_sgx':reconciled_sgx, 'reconciled_primo':reconciled_primo})

@app.route("/reconcile_2", methods=["GET"])
def reconcile_2():
    sgx = json.loads(requests.get('http://localhost:3000/read_sgx').content)
    primo = json.loads(requests.get('http://localhost:3000/read_primo').content)


    parsed_sgx = []
    parsed_primo = []

    for i in sgx:
        if i['Record']['Status']=='pending':
            parsed_sgx.append(i)

    ISIN_list = []

    for j in parsed_sgx:
        if j['Record']['ISIN'] not in ISIN_list:
            ISIN_list.append(j['Record']['ISIN'])

    includes = False

    for k in primo: 
        if k['Record']['Status'] == 'pending':    
            for ISIN in ISIN_list:
                # parsed_primo.append(k['REUT'])
                if ISIN in k['Record']['ISIN']:
                   
                    includes = True
                    k['Record']['ISIN'] = ISIN
                    parsed_primo.append(k)
                    break

            if(includes==True):
                includes=False
            else:
                parsed_primo.append(k)

    sgx_dict = {}
    primo_dict = {}
    
    for i in parsed_sgx:
        elements = [i['Record']['ISIN'],i['Record']['RT'],i['Record']['CLINO'],i['Record']['Settlement_price'],i['Record']['Execution_Date']]
        if tuple(elements) in sgx_dict:
            sgx_dict[tuple(elements)]['Quantity'] += int(i['Record']['Quantity'])
            sgx_dict[tuple(elements)]['ID_list'].append(i['Record']['ID'])
        else:
            sgx_dict[tuple(elements)] = {'Quantity':int(i['Record']['Quantity']),'ID_list':[i['Record']['ID']]}

    for i in parsed_primo:
        elements = [i['Record']['ISIN'],i['Record']['RT'],i['Record']['CLINO'],str(i['Record']['Settlement_price']),i['Record']['Execution_Date']]
        id_misc_elements = [str(i['Record']['ID']),str(i['Record']['Quantity']),str(i['Record']['REQUEST_TYPE']),str(i['Record']['TRADE_ID']),str(i['Record']['TRADE_VERSION_ID']),str(i['Record']['SOURCE_SYSTEM_ID']),str(i['Record']['SOURCE_SYSTEM']),str(i['Record']['FII']),str(i['Record']['BOOK']),str(i['Record']['COUNTERPARTY']),str(i['Record']['SETTLEMENT_DATE']),str(i['Record']['Alpha_status']),str(i['Record']['PRICING_CURRENCY']),str(i['Record']['PRINCIPAL']),str(i['Record']['ORDER_ID']),str(i['Record']['ORDER_SLANG'])]
        id_misc_string = '_'.join(id_misc_elements)
        if tuple(elements) in primo_dict:
            primo_dict[tuple(elements)]['Quantity'] += int(i['Record']['Quantity'])
            primo_dict[tuple(elements)]['ID_list'].append(id_misc_string)
        else:
            primo_dict[tuple(elements)] = {'Quantity':int(i['Record']['Quantity']),'ID_list':[id_misc_string]}

    failed_sgx = []
    failed_primo = []
    reconciled_sgx = []
    reconciled_primo = []

    for key, value in sgx_dict.items():
        if key not in primo_dict:
            empty_dict = {}
            empty_dict[key] = json.dumps(value)
            failed_sgx.append(empty_dict)
            continue
        
        if key in primo_dict and primo_dict[key]['Quantity']!=sgx_dict[key]['Quantity']:
            empty_dict = {}
            empty_dict[key] = json.dumps(value)
            failed_sgx.append(empty_dict)
            continue

        empty_dict = {}
        empty_dict[key] = json.dumps(value)
        reconciled_sgx.append(empty_dict)

    for key, value in primo_dict.items():
        if key not in sgx_dict:
            empty_dict = {}
            empty_dict[key] = json.dumps(value)
            failed_primo.append(empty_dict)
            continue
        
        if key in sgx_dict and sgx_dict[key]['Quantity']!=primo_dict[key]['Quantity']:
            empty_dict = {}
            empty_dict[key] = json.dumps(value)
            failed_primo.append(empty_dict)
            continue

        empty_dict = {}
        empty_dict[key] = json.dumps(value)
        reconciled_primo.append(empty_dict)

    return str({'failed_sgx':failed_sgx,'failed_primo':failed_primo,'reconciled_sgx':reconciled_sgx, 'reconciled_primo':reconciled_primo})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=2002, debug=True)
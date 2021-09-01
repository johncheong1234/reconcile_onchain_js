const express = require('express')
const app = express()
const cors = require('cors');
app.use(cors({
    origin: '*'
}));
// const fileUpload = require('express-fileupload');
const port = 3069
// var xlsx = require('node-xlsx').default;

const axios = require('axios')

// app.use(fileUpload());
app.use(express.json({limit: '200mb'}));
// app.use(express.urlencoded({limit: '200mb'}));
app.use(express.urlencoded({ extended: false, limit: '2gb' }));

app.get('/', async (req, res) => {
  res.send('Hello World!')
})

app.get('/reconcile',async(req,res)=>{
  const sgx_data = await axios.get('http://localhost:3000/read_sgx_pending')
  const sgx_assets = sgx_data.data;

  const primo_data = await axios.get('http://localhost:3000/read_primo_pending')
  const primo_assets = primo_data.data;

  const parsed_primo_assets = []
  const parsed_sgx_assets = []

  for(var i=0;i<sgx_assets.length;i++){
    if(sgx_assets[i]['Record']['Status']=='pending'){
        parsed_sgx_assets.push(sgx_assets[i])
    }
  }

  const ISIN = []

  for(var i=0; i<parsed_sgx_assets.length; i++){
      if(!ISIN.includes(parsed_sgx_assets[i]['Record']['ISIN'])){
      ISIN.push(parsed_sgx_assets[i]['Record']['ISIN'])
        }
      }

  var includes = false;

  for(var j=0; j<primo_assets.length; j++){
      if(primo_assets[j]['Record']['Status']=='pending'){
      for(var i=0; i<ISIN.length; i++){
          if(primo_assets[j]['Record']['ISIN'].includes(ISIN[i])){
          includes = true;
          parsed_primo_assets.push({'ID':primo_assets[j]['Record']['ID'],'Quantity':primo_assets[j]['Record']['Quantity'],'Execution_Date':primo_assets[j]['Record']['Execution_Date'],'ISIN':ISIN[i],'RT':primo_assets[j]['Record']['RT'],'CLINO':primo_assets[j]['Record']['CLINO'],'Settlement_price':primo_assets[j]['Record']['Settlement_price']})
          break
            }
                
          }

      if(includes == true){
          includes = false;
      }else{
          parsed_primo_assets.push({'ID':primo_assets[j]['Record']['ID'],'Quantity':primo_assets[j]['Record']['Quantity'],'Execution_Date':primo_assets[j]['Record']['Execution_Date'],'ISIN':primo_assets[j]['Record']['ISIN'],'RT':primo_assets[j]['Record']['RT'],'CLINO':primo_assets[j]['Record']['CLINO'],'Settlement_price':primo_assets[j]['Record']['Settlement_price']})
      }
        
    }
    }

    const sgx_dict = {}
    const primo_dict = {}

    for(var i=0; i<parsed_sgx_assets.length; i++){
        var elements = [parsed_sgx_assets[i]['Record']['ISIN'],parsed_sgx_assets[i]['Record']['RT'],parsed_sgx_assets[i]['Record']['CLINO'],parsed_sgx_assets[i]['Record']['Settlement_price'],parsed_sgx_assets[i]['Record']['Execution_Date']]
        var sgx_string = elements.join('_');
        if(sgx_dict[sgx_string]){
            sgx_dict[sgx_string]['Quantity'] += parseInt(parsed_sgx_assets[i]['Record']['Quantity']);
            sgx_dict[sgx_string]['ID_list'].push(parsed_sgx_assets[i]['Record']['ID'])
        }else{
            sgx_dict[sgx_string] = {'Quantity':parseInt(parsed_sgx_assets[i]['Record']['Quantity']), 'ID_list':[parsed_sgx_assets[i]['Record']['ID']]};
        }
    }

    for(var i=0; i<parsed_primo_assets.length; i++){
        var elements = [parsed_primo_assets[i]['ISIN'],parsed_primo_assets[i]['RT'],parsed_primo_assets[i]['CLINO'],parsed_primo_assets[i]['Settlement_price'],parsed_primo_assets[i]['Execution_Date']]
        var primo_string = elements.join('_');
        if(primo_dict[primo_string]){
            primo_dict[primo_string]['Quantity'] += parseInt(parsed_primo_assets[i]['Quantity']);
            primo_dict[primo_string]['ID_list'].push(parsed_primo_assets[i]['ID'])
        }else{
            primo_dict[primo_string] = {'Quantity':parseInt(parsed_primo_assets[i]['Quantity']), 'ID_list':[parsed_primo_assets[i]['ID']]};
        }
    }

    const failed_sgx = []
    const failed_primo = []
    const reconciled_sgx = []
    const reconciled_primo = []

    for (const trade in sgx_dict) {
        
        if(!(trade in primo_dict)){

            var empty_dict = {}
            empty_dict[trade] = JSON.stringify(sgx_dict[trade])
            failed_sgx.push(empty_dict)
            continue
        }
        
        if(trade in primo_dict && primo_dict[trade]['Quantity']!=sgx_dict[trade]['Quantity']){
        
            var empty_dict = {}
            empty_dict[trade] = JSON.stringify(sgx_dict[trade])
            failed_sgx.push(empty_dict)
            continue
        }

        var empty_dict = {}
        empty_dict[trade] = JSON.stringify(sgx_dict[trade])
        reconciled_sgx.push(empty_dict)
      }


    for (const trade in primo_dict) {
        
        if(!(trade in sgx_dict)){

            var empty_dict = {}
            empty_dict[trade] = JSON.stringify(primo_dict[trade])
            failed_primo.push(empty_dict)
            continue
        }
        
        if(trade in sgx_dict && sgx_dict[trade]['Quantity']!=primo_dict[trade]['Quantity']){
        
            var empty_dict = {}
            empty_dict[trade] = JSON.stringify(primo_dict[trade])
            failed_primo.push(empty_dict)
            continue
        }

        var empty_dict = {}
        empty_dict[trade] = JSON.stringify(primo_dict[trade])
        reconciled_primo.push(empty_dict)
      }

    res.send({'failed_sgx':failed_sgx,'failed_primo': failed_primo,'reconciled_sgx':reconciled_sgx, 'reconciled_primo':reconciled_primo});
})

app.get('/reconcile_2',async(req,res)=>{
  const sgx_data = await axios.get('http://localhost:3000/read_sgx_pending')
  const sgx_assets = sgx_data.data;

  const primo_data = await axios.get('http://localhost:3000/read_primo_pending')
  const primo_assets = primo_data.data;

  const parsed_primo_assets = []
  const parsed_sgx_assets = []

        for(var i=0;i<sgx_assets.length;i++){
            if(sgx_assets[i]['Record']['Status']=='pending'){
                parsed_sgx_assets.push(sgx_assets[i])
            }
        }

        const ISIN = []

        for(var i=0; i<parsed_sgx_assets.length; i++){
            if(!ISIN.includes(parsed_sgx_assets[i]['Record']['ISIN'])){
                ISIN.push(parsed_sgx_assets[i]['Record']['ISIN'])
            }
        }

        var includes = false;

        for(var j=0; j<primo_assets.length; j++){
            if(primo_assets[j]['Record']['Status']=='pending'){
            for(var i=0; i<ISIN.length; i++){
                if(primo_assets[j]['Record']['ISIN'].includes(ISIN[i])){
                includes = true;
                parsed_primo_assets.push({ORDER_SLANG: primo_assets[j]['Record']['ORDER_SLANG'],ORDER_ID: primo_assets[j]['Record']['ORDER_ID'],PRINCIPAL:primo_assets[j]['Record']['PRINCIPAL'],PRICING_CURRENCY: primo_assets[j]['Record']['PRICING_CURRENCY'],Alpha_status: primo_assets[j]['Record']['Alpha_status'],SETTLEMENT_DATE: primo_assets[j]['Record']['SETTLEMENT_DATE'],COUNTERPARTY: primo_assets[j]['Record']['COUNTERPARTY'],BOOK: primo_assets[j]['Record']['BOOK'], FII: primo_assets[j]['Record']['FII'],SOURCE_SYSTEM: primo_assets[j]['Record']['SOURCE_SYSTEM'],SOURCE_SYSTEM_ID: primo_assets[j]['Record']['SOURCE_SYSTEM_ID'],TRADE_VERSION_ID: primo_assets[j]['Record']['TRADE_VERSION_ID'],REQUEST_TYPE: primo_assets[j]['Record']['REQUEST_TYPE'],TRADE_ID:primo_assets[j]['Record']['TRADE_ID'],'ID':primo_assets[j]['Record']['ID'],'Quantity':primo_assets[j]['Record']['Quantity'],'Execution_Date':primo_assets[j]['Record']['Execution_Date'],'ISIN':ISIN[i],'RT':primo_assets[j]['Record']['RT'],'CLINO':primo_assets[j]['Record']['CLINO'],'Settlement_price':primo_assets[j]['Record']['Settlement_price']})
                break
                }
                
            }

            if(includes == true){
                includes = false;
            }else{
                parsed_primo_assets.push({ORDER_SLANG: primo_assets[j]['Record']['ORDER_SLANG'],ORDER_ID: primo_assets[j]['Record']['ORDER_ID'],PRINCIPAL:primo_assets[j]['Record']['PRINCIPAL'],PRICING_CURRENCY: primo_assets[j]['Record']['PRICING_CURRENCY'],Alpha_status: primo_assets[j]['Record']['Alpha_status'],SETTLEMENT_DATE: primo_assets[j]['Record']['SETTLEMENT_DATE'],COUNTERPARTY: primo_assets[j]['Record']['COUNTERPARTY'],BOOK: primo_assets[j]['Record']['BOOK'], FII: primo_assets[j]['Record']['FII'], SOURCE_SYSTEM: primo_assets[j]['Record']['SOURCE_SYSTEM'],SOURCE_SYSTEM_ID: primo_assets[j]['Record']['SOURCE_SYSTEM_ID'],TRADE_VERSION_ID: primo_assets[j]['Record']['TRADE_VERSION_ID'], REQUEST_TYPE: primo_assets[j]['Record']['REQUEST_TYPE'], TRADE_ID: primo_assets[j]['Record']['TRADE_ID'],'ID':primo_assets[j]['Record']['ID'],'Quantity':primo_assets[j]['Record']['Quantity'],'Execution_Date':primo_assets[j]['Record']['Execution_Date'],'ISIN':primo_assets[j]['Record']['ISIN'],'RT':primo_assets[j]['Record']['RT'],'CLINO':primo_assets[j]['Record']['CLINO'],'Settlement_price':primo_assets[j]['Record']['Settlement_price']})
            }
        
        }
        }

        const sgx_dict = {}
        const primo_dict = {}

        for(var i=0; i<parsed_sgx_assets.length; i++){
            var elements = [parsed_sgx_assets[i]['Record']['ISIN'],parsed_sgx_assets[i]['Record']['RT'],parsed_sgx_assets[i]['Record']['CLINO'],parsed_sgx_assets[i]['Record']['Settlement_price'],parsed_sgx_assets[i]['Record']['Execution_Date']]
            var sgx_string = elements.join('_');
            var elements_id_q = [parsed_sgx_assets[i]['Record']['ID'],parsed_sgx_assets[i]['Record']['Quantity']]
            var id_q_string = elements_id_q.join('_')
            if(sgx_dict[sgx_string]){
                sgx_dict[sgx_string]['Quantity'] += parseInt(parsed_sgx_assets[i]['Record']['Quantity']);
                sgx_dict[sgx_string]['ID_list'].push(id_q_string)
            }else{
                sgx_dict[sgx_string] = {'Quantity':parseInt(parsed_sgx_assets[i]['Record']['Quantity']), 'ID_list':[id_q_string]};
            }
        }

        for(var i=0; i<parsed_primo_assets.length; i++){
            var elements = [parsed_primo_assets[i]['ISIN'],parsed_primo_assets[i]['RT'],parsed_primo_assets[i]['CLINO'],parsed_primo_assets[i]['Settlement_price'],parsed_primo_assets[i]['Execution_Date']]
            var primo_string = elements.join('_');
            var elements_id_q = [parsed_primo_assets[i]['ID'],parsed_primo_assets[i]['Quantity'],parsed_primo_assets[i]['REQUEST_TYPE'],parsed_primo_assets[i]['TRADE_ID'],parsed_primo_assets[i]['TRADE_VERSION_ID'],parsed_primo_assets[i]['SOURCE_SYSTEM_ID'],parsed_primo_assets[i]['SOURCE_SYSTEM'],parsed_primo_assets[i]['FII'],parsed_primo_assets[i]['BOOK'],parsed_primo_assets[i]['COUNTERPARTY'],parsed_primo_assets[i]['SETTLEMENT_DATE'],parsed_primo_assets[i]['Alpha_status'],parsed_primo_assets[i]['PRICING_CURRENCY'],parsed_primo_assets[i]['PRINCIPAL'],parsed_primo_assets[i]['ORDER_ID'],parsed_primo_assets[i]['ORDER_SLANG']]
            var id_q_string = elements_id_q.join('_')
            if(primo_dict[primo_string]){
                primo_dict[primo_string]['Quantity'] += parseInt(parsed_primo_assets[i]['Quantity']);
                primo_dict[primo_string]['ID_list'].push(id_q_string)
            }else{
                primo_dict[primo_string] = {'Quantity':parseInt(parsed_primo_assets[i]['Quantity']), 'ID_list':[id_q_string]};
            }
        }

        const failed_sgx = []
        const failed_primo = []
        const reconciled_sgx = []
        const reconciled_primo = []

        for (const trade in sgx_dict) {
            
            if(!(trade in primo_dict)){

                var empty_dict = {}
                empty_dict[trade] = JSON.stringify(sgx_dict[trade])
                failed_sgx.push(empty_dict)
                continue
            }
            
            if(trade in primo_dict && primo_dict[trade]['Quantity']!=sgx_dict[trade]['Quantity']){
            
                var empty_dict = {}
                empty_dict[trade] = JSON.stringify(sgx_dict[trade])
                failed_sgx.push(empty_dict)
                continue
            }

            var empty_dict = {}
            empty_dict[trade] = JSON.stringify(sgx_dict[trade])
            reconciled_sgx.push(empty_dict)
          }


        for (const trade in primo_dict) {
            
            if(!(trade in sgx_dict)){

                var empty_dict = {}
                empty_dict[trade] = JSON.stringify(primo_dict[trade])
                failed_primo.push(empty_dict)
                continue
            }
            
            if(trade in sgx_dict && sgx_dict[trade]['Quantity']!=primo_dict[trade]['Quantity']){
            
                var empty_dict = {}
                empty_dict[trade] = JSON.stringify(primo_dict[trade])
                failed_primo.push(empty_dict)
                continue
            }

            var empty_dict = {}
            empty_dict[trade] = JSON.stringify(primo_dict[trade])
            reconciled_primo.push(empty_dict)
          }

        res.send({'failed_sgx':failed_sgx,'failed_primo': failed_primo,'reconciled_sgx':reconciled_sgx, 'reconciled_primo':reconciled_primo});
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
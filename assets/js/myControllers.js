// For the GetContracts
let contractSource = "http://207.148.17.86:7078/"; // http://127.0.0.1:7078/ -> Local | http://207.148.17.86:7078/ -> Public | http://testnet.phantasma.io:7078/ -> Testnet | External -> Other
let allContracts = [];
let tipAddress = "P2KBktG2MFc6zc3Gsdrt5G4EntPTDBK3WW4mVQiqvAzppFk";

// let RPC = new phantasmaJS.PhantasmaAPI('seed.ghostdevs.com:7077/rpc', 'https://ghostdevs.com/getpeers.json', 'mainnet');

let connected = false;
let contractName = "";
let contractAddress = "";
let payload = "";
let link; //= new PhantasmaLink("Pharming");
let contractsInfo = [];
let selectedContract = {};
let selectedMethod = {};

// Start Link
function startLink(){
    console.log("Contract: "+ contractName);
    link = new PhantasmaLink(contractName); 
}

// Login
function loginToPhantasma(providerHint) {
    link.login( function(success) {
        if (success) {
            connected = true;
            HandleLoggedIn();
        }else {
            NewMessage("Phantasma Link", "Error Login in.");
        }
    }, 2, "phantasma", providerHint);
}

// To Handle User Login
function HandleLoggedIn(){
    console.log("Logged in");
    NewMessage("Phantasma Link", "Logged in.");
    $("#loggedOut").hide();
    $("#loggedIn").show();
    $("#walletAddress").html(link.account.address);
    $("#walletAddress").attr('href', `https://explorer.phantasma.io/address/${link.account.address}`);
    InitContract();
}

// To Handle user Logout
function HandleLogOut(){
    connected = false;
    link = null;
    contractName = "";
    contractAddress = "";
    payload = "";
    NewMessage("Phantasma Link", `Logged out.`);
    console.log("Logged Out");
    $("#loggedIn").hide();
    $("#loggedOut").show();
    InitContract();
}

// Test Signature Method
function TestSignature(){ 
    console.log("My Signature Test");
    let rawData = "TestMySign";
    let encodedData = rawData.toString(16);
    link.signData(encodedData, function(singedInfo) { 
        if ( singedInfo.success ) {
            let random = singedInfo.random;
            let signedData = singedInfo.signature;
            console.log(`Signature:${signedData}\nRandom:${random}\nRawData:${rawData}\nEncodedData:${encodedData}`);
            NewMessage("Signature Test", `Signature:${signedData}\nRandom:${random}\nRawData:${rawData}\nEncodedData:${encodedData}`);
        }
    }, "ethereum")
}

// Get contract address

// Send Tokens
function SendTokens(symbol, amount){
    if (!link.account)
        return NewMessage("Phantasma Link", `Not connected to a wallet.`, "error");

    let address = String(link.account.address);
    
    var sb = new ScriptBuilder();
    var myScript = sb.
        allowGas(address).
        TransferTokens(symbol, address, contractAddress, amount*(10**GetDecimals(symbol))).
        spendGas(address).
        endScript();

    link.sendTransaction("main", myScript, payload, (script) =>
    {
        //let result = phantasmaJS.phantasmaJS.decodeVMObject(script.result);
        console.log(JSON.stringify(script, undefined, 4));
        $("#contractMethodOutput").val(JSON.stringify(script, undefined, 4));
        NewMessage("Send Tokens", `Tokens sent with success: ${amount**GetDecimals(symbol)} ${symbol}`);        
    });
}

// Stake Tokens
function StakeTokens(symbol, amount){ 
    if (!link.account)
        return NewMessage("Phantasma Link", `Not connected to a wallet.`, "error");

    let address = String(link.account.address);

    var sb = new ScriptBuilder();
    var myScript = sb.
        allowGas(address).
        callContract("stake", "stake", [contractAddress, amount*(10**GetDecimals(symbol))] ).
        spendGas(address).
        endScript();

    link.sendTransaction("main", myScript, payload, (script) =>
    {
        console.log(JSON.stringify(script, undefined, 4));
        $("#contractMethodOutput").val(JSON.stringify(script, undefined, 4));              
        NewMessage("Stake Tokens", `Tokens stake with success: ${amount**GetDecimals(symbol)} ${symbol}`);
    });
}

// Update Contract Owner
function UpdateOwner(to){
    if (!link.account)
        return NewMessage("Phantasma Link", `Not connected to a wallet.`, "error");

    let address = String(link.account.address);
    
    var sb = new ScriptBuilder();
    var myScript = sb.
        allowGas(address).
        callContract(contractName, "updateOwner", [String(to)]).
        spendGas(address).
        endScript();

    link.sendTransaction("main", myScript, payload, (script) =>
    {
        let result = phantasmaJS.phantasmaJS.decodeVMObject(script.result);
        console.log(JSON.stringify(result, undefined, 4));
        $("#contractMethodOutput").val(JSON.stringify(result, undefined, 4));
        NewMessage("Update Owner", `Owner updated with success to <b>${to}</b>`);
    });
}


// Create NFT's
/// @dev Mint a specific number of NFT on GhostMarket contract.
/// @param editionId - ID of the NFT series - number
/// @param editionMax - Edition Max the NFT series - number
/// @param editionMode - Edition Mode the NFT series, 1 for duplicate, 2 for unique - number
/// @param creator - Original owner of the NFT - address
/// @param royalties - Commission (in %) for the royalties - number
/// @param mintTicker - Ticker token on which to mint the NFT - string
/// @param numOfNfts - Quantity of NFT to mint - number
/// @param name - Name of the NFT to mint - string
/// @param description - Description of the NFT to mint - string
/// @param nftType - Type of the NFT - number
/// @param imageURL - Image URL of the NFT - IPFS hash - string
/// @param infoURL - Token URL of the NFT - External API - string
/// @param attributeType1 - Extended properties of the NFT - string
/// @param attributeValue1 - Extended properties of the NFT - string
/// @param attributeType2 - Extended properties of the NFT - string
/// @param attributeValue2 - Extended properties of the NFT - string
/// @param attributeType3 - Extended properties of the NFT - string
/// @param attributeValue3 - Extended properties of the NFT - string
/// @param lockedContent - NFT locked content hash - string
/// @param hasLocked - Locked content stored in contract - bool
function createNFTsDuplicate(){ 
    if (!link.account)
        return NewMessage("Phantasma Link", `Not connected to a wallet.`, "error");

    let address = String(link.account.address);

    let editionId = 0;
    let editionMax = 10000;
    let editionMode = 1;
    let creator = address;
    let royalties = 5;
    let mintTicker = "SPECC";
    let numOfNfts = 5;
    let name = "MyTestNFT SPECC";
    let description = "MyTestDesc NFT";
    let nftType = 1;
    let imageURL = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Picture_icon_BLACK.svg/1200px-Picture_icon_BLACK.svg.png";
    let infoURL = "https://phantasma.io/";
    let attributeType1 = "number";
    let attributeValue1 = 0;
    let attributeType2 = "string";
    let attributeValue2 = "test";
    let attributeType3 = "number";
    let attributeValue3 = 5;
    let lockedContent = "";
    let hasLocked = false;
    
    var sb = new ScriptBuilder();
    var myScript = sb.
        allowGas(address).
        callContract(contractName, "mintToken", [String(editionId), String(editionMax), String(editionMode) , String(creator),
             String(royalties), String(mintTicker), String(numOfNfts), String(name), String(description), String(nftType), String(imageURL), String(infoURL), String(attributeType1),
             String(attributeValue1), String(attributeType2), String(attributeValue2), String(attributeType3), String(attributeValue3), String(lockedContent), hasLocked]).
        spendGas(address).
        endScript();

    link.sendTransaction("main", myScript, payload, (script) =>
    {
        let result = phantasmaJS.phantasmaJS.decodeVMObject(script.result);
        console.log(JSON.stringify(result, undefined, 4));
        $("#contractMethodOutput").val(JSON.stringify(result, undefined, 4));
        NewMessage("Contract Call", `NFT Duplicate Call: Call executed with sucess.`);  
    });
}

// Create NFT's Unique
function createNFTsUnique(){
    if (!link.account)
        return NewMessage("Phantasma Link", `Not connected to a wallet.`, "error");

    let address = String(link.account.address);

    let editionId = 0;
    let editionMax = 10000;
    let editionMode = 2;
    let creator = address;
    let royalties = 5;
    let mintTicker = "SPECC";
    let numOfNfts = 1;
    let name = "MyTestNFT SPECC";
    let description = "MyTestDesc NFT";
    let nftType = 1;
    let imageURL = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Picture_icon_BLACK.svg/1200px-Picture_icon_BLACK.svg.png";
    let infoURL = "https://phantasma.io/";
    let attributeType1 = "number";
    let attributeValue1 = 0;
    let attributeType2 = "string";
    let attributeValue2 = "test";
    let attributeType3 = "number";
    let attributeValue3 = 5;
    let lockedContent = "";
    let hasLocked = false;
    
    var sb = new ScriptBuilder();
    sb = sb.allowGas(address);
    for(let i = 0; i < 2; i++){
        sb = sb.callContract(contractName, "mintToken", [String(editionId), String(editionMax), String(editionMode) , String(creator),
            String(royalties), String(mintTicker), String(numOfNfts), String(name+ " _ " +i), String(description + " _ " + i), String(nftType), String(imageURL), String(infoURL), String(attributeType1),
            String(attributeValue1), String(attributeType2), String(attributeValue2), String(attributeType3), String(attributeValue3), String(lockedContent), hasLocked]);
    }
    var myScript = sb.spendGas(address).endScript();

    link.sendTransaction("main", myScript, payload, (script) =>
    {
        let result = phantasmaJS.phantasmaJS.decodeVMObject(script.result);
        console.log(JSON.stringify(result, undefined, 4));
        $("#contractMethodOutput").val(JSON.stringify(result, undefined, 4));
        NewMessage("Contract Call", `NFT Unique Call: Call executed with sucess.`);  
    });
}

// Add an Args
function addArgs(){
    let arg = $(".contract-arg").length;
    let newArgs = `
    <div class="form-group row mb-2">
        <label for="Arg-${arg}" class="col-sm-2 col-form-label">Arg-${arg}</label>
        <div class="col-sm-10 ">
            <div class="input-group" id="Arg-${arg}">
                <input type="text" class="form-control col-sm contract-arg" placeholder="argName">
                <input type="text" class="form-control col-sm contract-arg-value" placeholder="argValue">
            </div>
        </div>
    </div>`;
    $("#args").html($("#args").html()+newArgs);
}

/// Helpers
function GetDecimals(symbol) {
    let result = 0;

    switch(symbol){
        case "SOUL":
            result = 8;
            break;
        case "KCAL":
            result = 10;
            break; 
    }

    return result;
}

// Contract Helpers
// Get Contract
function GetContract(name){
    let result = null;
    allContracts.forEach( function(value, index) { 
        if(value === name)
        {
            selectedContract = value;
            return value;
        }
    });

    return result;
}

// Get Method Information
function GetMethod(methodName){ 
    let method = null;
    selectedContract.methods.forEach( function(value, index) {
        if(value.name === methodName)
        { 
            method = value;
            selectedMethod = value;
            return method;
        }
    });
    return method;
}

// Load Contract.
function LoadContract(contract){ 
    contractName = contract.name;
    contractAddress = contract.address;
    payload = contract.name;
}

// Fill the Contract Available Methods.
function FillSelectWithContractFunctions(contract){
    $("#contractFunctions").html("");
    let contractFuntions = "<option selected>None</option>";
    console.log(contract);
    contract.methods.forEach( function(value, index) {
        contractFuntions += `<option value="${value.name}">${value.name}</option>`;
    });
    $("#contractFunctions").html(contractFuntions);
}

// Load Selected Method
function LoadMethod(method){ 
    let methodInfo = GetMethod(method);
    $("#methodName").val(methodInfo.name);
    $("#args").html("");
    let argsHtml = "";    
    if (methodInfo.parameters != null) {
        methodInfo.parameters.forEach(function(value, index){
            console.log(value);
            argsHtml += `
            <div class="form-group row mb-2">
                <label for="Arg-${index}" class="col-sm-2 col-form-label">${value.name} : ${value.type}</label>
                <div class="col-sm-10 ">
                    <div class="input-group">
                        <input type="text" class="form-control col-sm-2 contract-arg" value="${value.name}" placeholder="${value.name}">
                        <input type="text" class="form-control col-sm contract-arg-value" placeholder="ex: value">
                    </div>
                </div>
            </div>`;
        });
    }
    

    $("#args").html(argsHtml);
}

// Call Contract with InvokeScript
function CallContractInvoke(){ 
    if (!link.account)
        return NewMessage("Phantasma Link", `Not connected to a wallet.`, "error");

    let contractName = String(selectedContract.name);
    let methodName = String($("#methodName").val());
    let address = String(link.account.address);

    let argParams = [];

    $(".contract-arg-value").each(function() {
        argParams.push($(this).val());
    });
    
    console.log(argParams);

    var sb = new ScriptBuilder();
    var myScript =  sb.callContract(contractName, methodName, argParams)
                    .endScript();

    link.invokeRawScript("main", myScript, payload, (script) =>
    {
        console.log("result:",script);
        let htmlResponse = "";
        if (script.results != null )
            for (let i = 0; i < script.results.length; i++)
            {
                let result = phantasma.phantasmaJS.decodeVMObject(script.results[i]);
                htmlResponse += JSON.stringify(result, undefined, 4);
            }
        else
        { 
            let result = phantasma.phantasmaJS.decodeVMObject(script.result);
            htmlResponse+= JSON.stringify(result, undefined, 4);
        }
        $("#contractMethodOutput").val(htmlResponse);
        NewMessage("Contract Call", `InvokeScript: Call executed with sucess.`);  
    });
}

// Call Contract with SendTransaction
function CallContractTransaction(){ 
    if (!link.account)
        return NewMessage("Phantasma Link", `Not connected to a wallet.`, "error");

    let contractName = String(selectedContract.name);
    let methodName = String(selectedMethod.name);
    let address = String(link.account.address);
    let nullAddr = "S1111111111111111111111111111111111";
    let gasPrice = 100000;
    let gasLimit = 9999;


    let argParams = [];

    $(".contract-arg-value").each(function() {
        argParams.push($(this).val());
    });
    
    var sb = new ScriptBuilder()
                .allowGas(address, nullAddr, gasPrice, gasLimit)
                .callContract(contractName, methodName, argParams);
    var myScript = sb.spendGas(address).endScript();

    link.sendTransaction("main", myScript, payload, (script) =>
    {
        console.log("result:", script);
        let result = phantasma.phantasmaJS.decodeVMObject(script.result);
        console.log(JSON.stringify(result, undefined, 4));
        $("#contractMethodOutput").val(JSON.stringify(result, undefined, 4));
        NewMessage("Contract Call", `SendTransaction: Call executed with sucess.`);  
    });
}

// Get the Contract Information
function GetContractInfo(name)
{
    let linkToContractSource = "";
    //if ( contractSource.includes("http://testnet.phantasma.io:7078/") || contractSource.includes("http://207.148.17.86:7078/") )
    //    linkToContractSource = "https://proxy.jnovo.eu/redirect.php?url="+btoa(contractSource+`getContract?chainAddressOrName=main&contractName=${name}`); 
    //else
        linkToContractSource = contractSource+`getContract?chainAddressOrName=main&contractName=${name}`; 
    
    $.ajax({
		url: linkToContractSource,
		type: "get",
        dataType: "json",
		success: function (response) {
            selectedContract = response;
            payload = name;
            contractName = name;
            contractAddress = selectedContract.address;
            LoadContract(selectedContract);
            startLink();
            console.log("Contract:",selectedContract);
            NewMessage("API", `Fetched the Contract Info with success`);
            FillSelectWithContractFunctions(selectedContract);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log(textStatus, errorThrown);
            NewMessage("API", `Error Fetching the Contract Info`, "error");    
		}
	});
}


/// Load all the contracts from SPOOK/API
async function GetAllContracts(){
    let linkToContractSource = "";
    //if ( contractSource.includes("http://testnet.phantasma.io:7078/") || contractSource.includes("http://207.148.17.86:7078/") )
    //    linkToContractSource = "https://proxy.jnovo.eu/redirect.php?url="+btoa(contractSource+"getChains"); 
    //else 
        linkToContractSource = contractSource+"getChains"; 

    $.ajax({
		url: linkToContractSource,
		type: "get",
        dataType: "json",
		success: function (response) {
            allContracts = response[0].contracts;
            contractsInfo = allContracts;
            $("#apiStatus").html(`<span style="color:green;" class="text-wrap">Connected to <span style="color:lightgreen;">${contractSource}</span></span>`);   
            NewMessage("API", `Fetched the API Data with success`);    
            FillContractsInfo();
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log(textStatus, errorThrown);
            $("#apiStatus").html(`<span style="color:red;">Not connected</span>`);   
            NewMessage("API", `Error Fetching the API Info`, "error");    
		}
	});
}

// Fill Contracts
function FillContractsInfo(){ 
    $("#contractSelectName").html("");
    let contractsNames = "<option value='0' selected>Select the contract</option>";
    allContracts.forEach( function(value, index) {
        contractsNames += `<option value="${value}">${value}</option>`;
    });
    $("#contractSelectName").html(contractsNames);
}

// API
function SetContractAPIURL(url){
    contractSource = url;
    GetAllContracts();
}

// API Button
function SaveAPIURL(){ SetContractAPIURL($("#apiURL").val()); }

// Contract
function InitContract(){ 
    if ( !connected )
        $("#contractStatus").html(`<span style="color:red;">Not connected</span>`);
    else
        $("#contractStatus").html(`<span style="color:green;">Connected to <span style="color:lightgreen;">${selectedContract.name}</span></span>`);       
}

// TIP
function TIP(amount, symbol){
    if (!link.account)
        return NewMessage("Phantasma Link", `Not connected to a wallet.`, "error");

    let address = String(link.account.address);
    
    var sb = new ScriptBuilder();
    var myScript = sb.
        allowGas(address).
        TransferTokens(symbol, address, tipAddress, amount*(10**GetDecimals(symbol))).
        spendGas(address).
        endScript();

    link.sendTransaction("main", myScript, payload, (script) =>
    {
        console.log("result:",script);    
        NewMessage("TIP", `Thank you for the TIP: ${amount**GetDecimals(symbol)} ${symbol}`);       
    });
}

// New Message 
function NewMessage(title, text, type = null){
    let myHTML = `
        <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <strong class="me-auto">${title}</strong>
                <small class="text-muted">just now</small>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${text}
            </div>
        </div>
    `;

    $("#myToasts").append(myHTML);

    $(".toast").each(function(index, value) { 
        value.addEventListener('hidden.bs.toast', function () {
            value.innerHTML = "";
            value.remove();
          })
    })

    let lastToast = $(".toast")[$(".toast").length-1];
    let toast = new bootstrap.Toast(lastToast);
    toast.show();
}

// Decode Information
function DecodeToUI(info, isToken){
    let result = {};
    if ( !isToken )
        result = phantasmaJS.phantasmaJS.decodeVMObject(info);
    else
        result = phantasmaJS.phantasmaJS.getTokenEventData(info);

    //console.log(JSON.stringify(result, undefined, 4));
    $("#contractMethodOutput").val(JSON.stringify(result, undefined, 4));
}

function GetHashInfo(hash){ 
    let linkToContractSource = "";
    //if ( contractSource.includes("http://testnet.phantasma.io:7078/") || contractSource.includes("http://207.148.17.86:7078/") )
    //    linkToContractSource = "https://proxy.jnovo.eu/redirect.php?url="+btoa(contractSource+`getTransaction?hashText=${hash}`); 
    //else
        linkToContractSource = contractSource+`getTransaction?hashText=${hash}`; 

    $.ajax({
		url: linkToContractSource,
		type: "get",
        dataType: "json",
		success: function (response) {
            $("#contractMethodOutput").val(JSON.stringify(response, undefined, 4));
            NewMessage("API", `Fetched the Hash Info with success`);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			console.log(textStatus, errorThrown);
            NewMessage("API", `Error Fetching the Hash Info`, "error");    
		}
	});
}

// Jquery Main Script
$(document).ready(function() {

    //LoadAllContracts();

    $("#contractFunctions").on("change", function(e) {
        // Load the Method;
        LoadMethod($(this).val());
    });

    $("#contractName").on("change", function(e) {
        contractName = $(this).val();
        contractAddress = selectedContract.address;
        payload = contractName; //.toLowerCase()
        console.log("payload:",payload);
    });

    $("#callContractMethodInvoke").on("click", function() { 
        CallContractInvoke();
    });

    $("#callContractMethodTransaction").on("click", function(e) {
        CallContractTransaction();
    });

    // Send Tokens Button
    $("#sendTokens").on("click", function(e) {
        let symbol = $("#symbolToken").val();
        let amount = $("#amountSendStake").val();
        SendTokens(symbol, amount);
    });

    // Stake Tokens Button
    $("#stakeTokens").on("click", function(e) {
        let symbol = $("#symbolToken").val();
        let amount = $("#amountSendStake").val();
        StakeTokens(symbol, amount);
    });

    // Update Owner Button
    $("#updateOwner").on("click", function(e) {
        let owner = $("#ownerAddress").val();
        UpdateOwner(owner);
    });

    // Create NFTs
    $("#createNFTS").on("click", function (e) {
        alert("Working");
        createNFTsDuplicate();
    });

    // Create Unique NFTS
    $("#createNFTUnique").on("click", function (e) {
        alert("Create Unique");
        createNFTsUnique();
    });

    // Clear All Args
    $("#clearArgs").on("click", function (e) {
        $("#args").html(`<div class="form-group row mb-2">
            <label for="Arg0" class="col-sm-2 col-form-label">Arg-0</label>
            <div class="col-sm-10 ">
                <div class="input-group">
                    <input type="text" class="form-control col-sm contract-arg" placeholder="argName">
                    <input type="text" class="form-control col-sm contract-arg-value" placeholder="argValue">
                </div>
            </div>
        </div>`);
    });

    // On Contract Selected Name Changed
    $("#contractSelectName").on("change", function(e) {
        let contractName = $(this).val();
        if ( contractName != "0") {
            $("#contractNameInput").val("");
            HandleLogOut();
            GetContractInfo(contractName);
        }
    });

    // Save Contract
    $("#saveContract").on("click", function (e) {
        // Check if the contract contractNameInput is empty
        if ( $("#contractNameInput").val() === "")
            return;
        else 
        {
            $("#contractSelectName").val('0').change();
            let contractName = $("#contractNameInput").val();
            HandleLogOut();
            GetContractInfo(contractName);
        }
    });

    $("#contractNameInput").on("change", function (e) {
        $("#contractSelectName").val('0').change();
    });

    // Login
    $(".login").on("click", function(e) {
        let providerHint = $(this).data("wallet");
        loginToPhantasma(providerHint);
    });

    // Logout 
    $("#logout").on("click", function (e) {
        HandleLogOut();
    });

    // Signature Test
    $("#testSignature").on("click", function() { 
        // TestSignObject
        let rawData = "TestMySign";
        let encodedData = rawData.toString(16);
        console.log(rawData," - ",encodedData);
    });

    // TIP
    $("#tipButton").on("click", function(){ 
        TIP( $("#tipAmount").val(), $("#tipSymbolToken").val());
    });

    // Decode Info
    $("#decodeInfoBtn").on("click", function(){ 
        let info = $("#decodeInfo").val();
        let isToken = $("#decodeEvent").prop('checked');
        DecodeToUI(info, isToken);
    })

    $("#hashBtn").on("click", function(){ 
        let hash = $("#hashTxt").val();
        GetHashInfo(hash);
    })
});
function P_countCapacity(original_coeffs)
{
	var capacity = 0, length = original_coeffs[0].length;
	for(var index = 0; index < 3; index++)
		for (var i = 0; i < length; i++)
			for (var j = 0; j < 64; j++)
				if (original_coeffs[index][i][j] != 0)
					capacity++;
	return capacity-222;
}

function P_http(params, cb_OnResponse)
{
	var xhttp = new XMLHttpRequest();
	var url = "http://localhost:8000/passlok.html";
	xhttp.open("POST", url, true);
	xhttp.onreadystatechange = function()
	{
		if (xhttp.readyState==4 && xhttp.status==200)
		{
			cb_OnResponse(xhttp.response);
		}
	};
	xhttp.send(params);
}

function P_i(message)
{
	console.log(message);
}

function P_saveText(txt, fileName)
{
	var data = new Blob([txt], {type: 'text/plain'});
	var textFile = window.URL.createObjectURL(data);

	var a = document.createElement('a');
	a.setAttribute('href', textFile);
	a.setAttribute('download', fileName);
	a.style.display = "none";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);

}

function P_saveFile(uri, fileName)
{
	var a = document.createElement('a');
	a.setAttribute('href', uri);
	a.setAttribute('download', fileName);
	a.style.display = "none";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}

function P_saveFile2(uri, fileName)
{
	var a = document.createElement('a');
	a.setAttribute('href', URL.createObjectURL(dataURLtoBlob(uri)));
	a.setAttribute('download', fileName);
	a.style.display = "none";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}

function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

function P_randomMessage(numBytes)
{
	var largeEnough = P_getLargeEnoughDicts(numBytes);
	if (largeEnough.length ==0)
	{
		throw("Can't find a dictionary large enough!");
	}
	
	var chosen = largeEnough[P_randomNumber(0,largeEnough.length-1)];
	var startRange = chosen.content.substring(0,chosen.length-numBytes);
	var newLineIndices = [], index = 0;
	newLineIndices[index++] = 0;
	for (var i = 0; i < startRange.length; i++)
	{
		if (startRange.charAt(i)=='\n')
		{
			newLineIndices[index++] = i+1;
		}
	}
	
	var lineIndex = P_randomNumber(0, newLineIndices.length-1); // line index counts from 0, e.g. first line is 0, second line is 1
	var startingPoint = newLineIndices[lineIndex];
	
	var message = chosen.content.substring(startingPoint, startingPoint+numBytes);
	
	return {
		dictName: chosen.name,
		lineIndex: lineIndex+1,
		message: message
	};
}

function P_getLargeEnoughDicts(minLength)
{
	var largeEnough = [];
	var index = 0;
	if (shakespeare_allcombined.length > minLength)
		largeEnough[index++] = shakespeare_allcombined;
	if (shakespeare_allswell.length > minLength)
		largeEnough[index++] = shakespeare_allswell;
	if (shakespeare_asyoulikeit.length > minLength)
		largeEnough[index++] = shakespeare_asyoulikeit;
	if (shakespeare_cleopatra.length > minLength)
		largeEnough[index++] = shakespeare_cleopatra;
	if (shakespeare_comedy_errors.length > minLength)
		largeEnough[index++] = shakespeare_comedy_errors;
	if (shakespeare_coriolanus.length > minLength)
		largeEnough[index++] = shakespeare_coriolanus;
	if (shakespeare_cymbeline.length > minLength)
		largeEnough[index++] = shakespeare_cymbeline;
	if (shakespeare_hamlet.length > minLength)
		largeEnough[index++] = shakespeare_hamlet;
	if (shakespeare_henryiv.length > minLength)
		largeEnough[index++] = shakespeare_henryiv;
	if (shakespeare_henryv.length > minLength)
		largeEnough[index++] = shakespeare_henryv;
	if (shakespeare_henryvi.length > minLength)
		largeEnough[index++] = shakespeare_henryvi;
	if (shakespeare_henryviii.length > minLength)
		largeEnough[index++] = shakespeare_henryviii;
	if (shakespeare_john.length > minLength)
		largeEnough[index++] = shakespeare_john;
	if (shakespeare_julius_caesar.length > minLength)
		largeEnough[index++] = shakespeare_julius_caesar;
	if (shakespeare_lear.length > minLength)
		largeEnough[index++] = shakespeare_lear;
	if (shakespeare_lll.length > minLength)
		largeEnough[index++] = shakespeare_lll;
	if (shakespeare_macbeth.length > minLength)
		largeEnough[index++] = shakespeare_macbeth;
	if (shakespeare_measure.length > minLength)
		largeEnough[index++] = shakespeare_measure;
	if (shakespeare_merchant.length > minLength)
		largeEnough[index++] = shakespeare_merchant;
	if (shakespeare_merry_wives.length > minLength)
		largeEnough[index++] = shakespeare_merry_wives;
	if (shakespeare_midsummer.length > minLength)
		largeEnough[index++] = shakespeare_midsummer;
	if (shakespeare_much_ado.length > minLength)
		largeEnough[index++] = shakespeare_much_ado;
	if (shakespeare_othello.length > minLength)
		largeEnough[index++] = shakespeare_othello;
	if (shakespeare_pericles.length > minLength)
		largeEnough[index++] = shakespeare_pericles;
	if (shakespeare_richardii.length > minLength)
		largeEnough[index++] = shakespeare_richardii;
	if (shakespeare_richardiii.length > minLength)
		largeEnough[index++] = shakespeare_richardiii;
	if (shakespeare_romeo_juliet.length > minLength)
		largeEnough[index++] = shakespeare_romeo_juliet;
	if (shakespeare_taming_shrew.length > minLength)
		largeEnough[index++] = shakespeare_taming_shrew;
	if (shakespeare_tempest.length > minLength)
		largeEnough[index++] = shakespeare_tempest;
	if (shakespeare_timon.length > minLength)
		largeEnough[index++] = shakespeare_timon;
	if (shakespeare_titus.length > minLength)
		largeEnough[index++] = shakespeare_titus;
	if (shakespeare_troilus_cressida.length > minLength)
		largeEnough[index++] = shakespeare_troilus_cressida;
	if (shakespeare_twelfth_night.length > minLength)
		largeEnough[index++] = shakespeare_twelfth_night;
	if (shakespeare_two_gentlemen.length > minLength)
		largeEnough[index++] = shakespeare_two_gentlemen;
	if (shakespeare_winters_tale.length > minLength)
		largeEnough[index++] = shakespeare_winters_tale;
	return largeEnough;
}

function P_randomNumber(lower, upper)
{
	return Math.floor(Math.random()*(upper-lower+1))+lower;
}

function P_randomBase64String(length)
{
	var result = "";
	for (var i = 0; i < length; i++)
	{
		var pos = Math.floor(Math.random()*base64.length);
		result += base64.substring(pos, pos+1);
	}
	return result;
}

function P_coverName(url)
{
	var inputName = url.substring(url.lastIndexOf("/")+1);
	return inputName+"_s_PL_rate-00.jpg";
}

function P_stegoName(url, rate)
{
	var inputName = url.substring(url.lastIndexOf("/")+1);
	var rateString = rate+"";
	while (rateString.length < 2)
		rateString = "0"+rateString;
	return inputName+"_s_PL_rate-"+rateString+".jpg";
}

function P_CSVName(url, rate)
{
	var inputName = url.substring(url.lastIndexOf("/")+1);
	var rateString = rate+"";
	while (rateString.length < 2)
		rateString = "0"+rateString;
	return inputName+"_s_PL_rate-"+rateString+".csv";
}

function P_testCoeffs(coeffs)
{
	P_i("coeffs length: " + coeffs.length);
	var i = coeffs.length-3;
	P_i("coeffs["+i+"][0] = " + coeffs[i][0].join(","));
}
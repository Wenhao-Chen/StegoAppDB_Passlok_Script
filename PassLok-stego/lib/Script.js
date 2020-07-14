
function Script_go(input) // array of input image partial paths. e.g. "Pixel1-1/JPG/Scene-001_xxx/xxx.jpg"
{
	inputImages = input;
	inputIndex = 0;
	totalSeconds = 0;
	
	minEmbeddingRate = 5;
	maxEmbeddingRate = 25;
	incrementER = 5;
	
	scriptMode = "5to25";
	
	P_i("Script mode: " + scriptMode + ". Quality: " + JPEGQuality + ". Input image count: " + inputImages.length);
	Script_embedNext();
}

function Script_goRandom(input)
{
	inputImages = input;
	inputIndex = 0;
	totalSeconds = 0;
	
	scriptMode = "random5to20";
	
	P_i("Script mode: " + scriptMode + ". Quality: " + JPEGQuality + ". Input image count: " + inputImages.length);
	Script_embedNext();
}

function Script_embedNext()
{
	if (inputIndex >= inputImages.length)
	{
		P_i("All done.");
		return;
	}
	
	if (scriptMode == "random5to20")
	{
		minEmbeddingRate = P_randomNumber(5, 20);
		maxEmbeddingRate = minEmbeddingRate;
		incrementER = 1;
	}
	partialPath = inputImages[inputIndex++];
	Script_embed(partialPath);
}


var scriptMode;

var inputImages, inputIndex, totalSeconds;


var jpegEncoder, original_coeffs, stego_coeffs;
var stats_k, stats_capacity, stats_embedded, stats_changed;

const MinPasswordLength = 8, MaxPasswordLength = 16;
const JPEGQuality = 90;

var minEmbeddingRate, maxEmbeddingRate, incrementER;

function Script_embed(partialPath)
{
	//P_i("partial path: " + partialPath);
	var time_start = new Date().getTime();
	var htmlImg  = new Image();
	htmlImg.crossOrigin = "Anonymous";
	htmlImg.onload = function()
	{
		init(htmlImg); // initialize JPEGEncoder and get the coefficients
		
		saveImage(original_coeffs, P_coverName(partialPath)); // save cover image

		//maxEmbeddingRate = minEmbeddingRate;
		for (var rate = minEmbeddingRate; rate <= maxEmbeddingRate; rate += incrementER)
		{
			stego_coeffs = original_coeffs.slice(0);
			
			var messageLength = stats_capacity*rate/100-48-4;	// payload bits excluding the EOF and k
			messageLength = Math.floor(messageLength/24+0.5)*24;	// nearest bit count that divides 24
			messageLength /= 8;									// number of 8-bit characters
			var messageInfo = P_randomMessage(messageLength);
			var message = messageInfo.message;
			//P_i("chosen dict name " + messageInfo.dictName);
			//P_i("chosen line index " + messageInfo.lineIndex);
			//P_i("whole message:\n"+messageInfo.message);
			
			var pw = P_randomBase64String(P_randomNumber(MinPasswordLength,MaxPasswordLength));
			//P_i("random password: " + pw);
			
			//message = "Hello World";
			//pw = "123456";
			stego_coeffs = Script_embedCoeffs(stego_coeffs, message, pw, P_stegoName(partialPath, rate));

			saveImage(stego_coeffs, P_stegoName(partialPath, rate));
			
			var stats = "Input Image,"+partialPath
				      + "\nStego App,Passlok"
					  + "\nCover Image," + P_coverName(partialPath)
					  + "\nCapacity," + stats_capacity
					  + "\nEmbedding Rate," + stats_embedded/stats_capacity
					  + "\nEmbedded," + stats_embedded
					  + "\nChanged," + stats_changed
					  + "\nInput Dictionary," + messageInfo.dictName
					  + "\nDictionary Starting Line," + messageInfo.lineIndex
					  + "\nInput Message Length (bytes)," + messageLength
					  + "\nPassword," + pw
					  + "\nPasslok_k," + stats_k
					  + "\nJPEG Quality," + JPEGQuality;
			if (scriptMode == "random5to20")
				stats += "\nRandom Embedding Rate,from 5 to 20%";
			
			P_saveFile("data:text/plain;charset=utf-8," + encodeURIComponent(stats), P_CSVName(partialPath, rate));
			
			//P_i("stats rate/k/capacity/embedded/changed = " + rate/100+"/"+stats_k+"/"+stats_capacity+"/"+stats_embedded+"/"+stats_changed);
		}
		var duration = new Date().getTime() - time_start;
		totalSeconds += duration/1000;
		var avgSeconds = totalSeconds/(inputIndex);
		var remainingSeconds = avgSeconds*(inputImages.length-inputIndex);
		var remainingMinutes = Math.floor(remainingSeconds/60);
		var remainingHours = Math.floor(remainingMinutes/60);
		P_i("Finished " + inputIndex + "/" + inputImages.length + "  " + partialPath.substring(partialPath.lastIndexOf("/")+1)
			+ ". Execution time: " + duration/1000 + " seconds"
			+ ". Estimated time remaining: " + remainingHours + " H " + remainingMinutes%60 +" M.");
		return;
		Script_embedNext();
	}
	htmlImg.src = "http://127.0.0.1:8887/"+partialPath;
}



function Script_embedCoeffs(stego_coeffs, message, pw, prefix)
{
	//message evolution(assuming no LZ-compression, just vanila base64):
	// base64String.length = Math.ceil(plaintext.length*8/6)
	// base64String.length*6 + 48 + 4 = totalEmbedded; // 48 is for the EOF marker, 4 is for k
	if (prefix)
		P_saveText(message, prefix+"_plain.txt");
	var encodedMessage = b64EncodeUnicode(message).replace(/=+$/,'');
	if (prefix)
		P_saveText(encodedMessage, prefix+"_encoded.txt");
	var messageBytes = toBin(encodedMessage);
	
	//P_i("encoded message="+encodedMessage);
	
	var msgBin = messageBytes.concat(imgEOF);
	var length = original_coeffs[0].length;
	var rawLength = 3*length*64;
	var rawCoefficients = new Array(rawLength);
	
	for(var index = 0; index < 3; index++)
		for (var i = 0; i < length; i++)
			for (var j = 0; j < 64; j++)
				rawCoefficients[index*length*64 + i*64 + j] = original_coeffs[index][i][j];
	
	allCoefficients = removeZeros(rawCoefficients);
	
	var seed = pw + allCoefficients.length.toString()+"jpeg";
	seedPRNG(seed, 0);


	shuffleCoefficients();

	//P_saveText(seed, "Seed.txt");
	//P_saveText(""+msgBin, "Before.txt")
	if (prefix)
		P_saveText(""+msgBin, prefix+"_cleanBin.txt");
	msgBin = addNoise(msgBin);
	if (prefix)
		P_saveText(""+msgBin, prefix+"_noisedBin.txt");
	//P_i("After noise: " +msgBin);
	//P_saveText(""+msgBin, "After.txt")

	//return;
	
	//P_i("msgBin=" + msgBin.join(" "));
	//P_i("seed/jpgIter=" + seed+"/0");
	
	encodeToCoefficients('jpeg', msgBin, 0);
	
	unShuffleCoefficients();
	
	var j = 0;
	for(var i = 0; i < rawLength; i++) // add 0 back in
	{
		if(rawCoefficients[i])
		{
			rawCoefficients[i] = allCoefficients[j];
			j++;
		}
	}
	allCoefficients = null;
	
	
	for(var index = 0; index < 3; index++)
	{
		for (var i = 0; i < length; i++)
		{
			for (var j = 0; j < 64; j++)
			{
				stego_coeffs[index][i][j] = rawCoefficients[index*length*64 + i*64 + j];
			}
		}
	}

	rawCoefficients = null;
	return stego_coeffs;
}

function init(htmlImg)
{
	
	var canvas = document.createElement("canvas");
	canvas.width = htmlImg.width;
	canvas.height = htmlImg.height;
	var context = canvas.getContext("2d");
	context.drawImage(htmlImg, 0, 0);
	var imageData = context.getImageData(0,0, canvas.width, canvas.height);
	jpegEncoder = new JPEGEncoder();
	original_coeffs = jpegEncoder.wenhaoc_getCoefficients(imageData, JPEGQuality);

	var text = "";


	/*for (var i = 0; i < original_coeffs.length; i++)
	{
		P_i("saving "+i);
		var text = "";
		for (var j = 0; j < original_coeffs[0].length; j++)		
		{
			for (var k = 0; k < original_coeffs[0][0].length; k++)
			{
				text += original_coeffs[i][j][k]+" "
			}
			text += "\n"
		}
		P_saveText(text, "coeffs_"+i+".txt");
	}*/

	
	stats_capacity = P_countCapacity(original_coeffs);
}


function saveImage(coeffs, name)
{
	//P_i("saving image " + name);
	var uri = jpegEncoder.wenhaoc_writeImage(coeffs, JPEGQuality);
	P_saveFile2(uri, name);
}
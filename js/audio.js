  var source, animationId;
  // Safariでは動かない
  //var audioContext = new AudioContext;
  // Safariでも動く
  var AudioContext = window.AudioContext || window.webkitAudioContext,
    audioContext      = new AudioContext();
  var fileReader   = new FileReader;

  var analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.9;//defoult:0.8
  analyser.connect(audioContext.destination);

  fileReader.onload = function(){
    console.log("onload");
    audioContext.decodeAudioData(fileReader.result, function(buffer){
      if(source) {
        source.stop();
        cancelAnimationFrame(animationId);
      }
　
      source = audioContext.createBufferSource();

      source.buffer = buffer;
      source.connect(analyser);

      source.start(0);
　
      animationId = requestAnimationFrame(renderA);
    });
    //$("#file").css("display","none");
  };
　
$(function(){//これないとうごかない
    $("#file").on("change",function(e){
      console.log("onchange");
      fileReader.readAsArrayBuffer(e.target.files[0]);
    });
});
　
  var difference = 0;
  var preAva = 0;
  var spectrums;
  renderA = function(){
    var counts = 0;
    var Ava = 0;
    spectrums = new Uint8Array(analyser.frequencyBinCount);

    analyser.getByteFrequencyData(spectrums);

    for(var i=0, len=spectrums.length; i<len; i++){
      Ava += spectrums[i];
      if(spectrums[i] !==0){
        counts++;
      }
    }//for

    Ava = Ava/counts;//(spectrums.length-1);// Ava/i と同じ
    difference = Ava - preAva;
    preAva = Ava;

    $("#difference").text("diffrrence: "+difference);
    $("#Ava").text("Ava: "+Ava);

    animationId = requestAnimationFrame(renderA);

  };//renderA

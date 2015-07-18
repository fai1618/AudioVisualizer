var audioVisualize = function(){
    var self = this;
    var source,animationId;
    // Safariでも動く
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioContext = new AudioContext();
    var fileReader   = new FileReader();



//マイク確認用
    filter = audioContext.createBiquadFilter();
    //filter.type = 0;
    filter.frequency.value = 440;

    this.init = function (){//マイク使えるか確認
        var audioObj = {"audio":true};

        //エラー処理
        var errBack = function(e){
            console.log("Web Audio error:",e.code);
        };

        //WebAudioリクエスト成功時に呼び出されるコールバック関数
        function gotStream(stream){
            //streamからAudioNodeを作成
            var mediaStreamSource = audioContext.createMediaStreamSource(stream);

            mediaStreamSource.connect(filter);

            filter.connect(self.analyser);

            self.animationJudge = true;
        }
        //マイクの有無を調べる
        if(navigator.webkitGetUserMedia){
            //マイク使って良いか聞いてくる
            navigator.webkitGetUserMedia(audioObj,gotStream,errBack);
        }else{
            alert("マイクデバイスがありません");
        }
    }
//マイク確認用end


    self.analyser = audioContext.createAnalyser();
    self.analyser.fftSize = 1024;
    self.analyser.smoothingTimeConstant = 0.8;//defoult:0.8
    self.analyser.connect(audioContext.destination);

    self.animationJudge = false;
    var ave_diffShowJudge = false;//renderでAve,differenceをdivに描画するかどうか

    fileReader.onload = function () {
        console.log("onload");
        audioContext.decodeAudioData(fileReader.result, function (buffer) {
            if (source) {
                source.stop();
                self.animationJudge = false;
            }

            source = audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(self.analyser);
            source.start(0);

            self.animationJudge = true;
        });
    };


    this.addInputDom = function(){
        var inputDom = $("<input>").attr("id","file").attr("type","file").attr("accept","audio/*");
        $("body").append(inputDom);
    };



    this.addChangeEvent = function () {//これないとうごかない
            $("#file").on("change", function (e) {
            console.log("onchange");
            fileReader.readAsArrayBuffer(e.target.files[0]);
        });
    }



    this.addAveDifferenceDom = function(){
        var aveDom = $("<div>").attr("id","Ave");
        var differenceDom = $("<div>").attr("id","difference");
        $("body").append(differenceDom).append(aveDom);
        ave_diffShowJudge = true;
    }


    this.arduinoJudge = false;
    this.difference = 0;
    this.ave = 0;
    var preAve = 0;
    var spectrums;
    var spectrumCounts;
    var i = 0,len = 0;

    this.render = function() {
        if(self.animationJudge){
            spectrumCounts = 0,this.ave = 0;
            spectrums = new Uint8Array(self.analyser.frequencyBinCount);

            self.analyser.getByteFrequencyData(spectrums);

            for (i = 0, len = spectrums.length; i < len; i++) {
                this.ave += spectrums[i];
                if (spectrums[i] !== 0) {
                    spectrumCounts++;
                }
            }

            if(spectrumCounts !== 0){
                this.ave = this.ave / spectrumCounts;//(spectrums.length-1);// this.ave/i と同

                this.difference = this.ave - preAve;
                preAve = this.ave;

                if(ave_diffShowJudge){
                    $("#difference").text("diffrrence: " + this.difference);
                    $("#Ave").text("Ave: " + this.ave);
                }
                if(this.arduinoJudge){
                    if(this.difference > 2){//test!!!!!
                        socket.emit("arduinoCommand","ON_13");
                    }

                    if(this.difference > 1){//test!!!!!
                        socket.emit("arduinoCommand","ON_12");
                    }
                }
            }
        }
        animationId = window.requestAnimationFrame(this.render.bind(this));//requestAnimationFrameはグローバルオブジェクト => 引数の関数を呼ばれると、内部のthisはwindowを指す
    }//render
}

$(function(){


    var canvas = $("<canvas/>")[0];
    $(canvas).attr("id","line-visualizer");

    $(canvas).css("width",$(window).width());
    $(canvas).css("height",$(window).height()*1/5);
    $(canvas).css("display","none");

    $(window).resize(function(){
        console.log("line-resize");
        $(canvas).css("width",$(window).width());
        $(canvas).css("height",$(window).height()*1/5);
    });


    $("body").append(canvas);
    var canvasContext = canvas.getContext('2d');
    $(canvas).attr("width",audio.analyser.frequencyBinCount*1.3+10);

    console.log($(canvas).attr("width"));
    $(canvas).attr("height",$(canvas).attr("width")*$(window).height()/$(window).width());

    var height = $(canvas).attr("height");
    var BorderWidth = audio.analyser.frequencyBinCount * 10;
    var a  = 0.5;
    var _r = '00';
    var _g = 'aa';
    var _b = 'e1';

    canvasContext.fillStyle = '#ffffff';
    canvasContext.fillRect(10, 10, 100,100);

    var lineRender = function(){
        if(audio.animationJudge){
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);

        var spectrums = new Uint8Array(audio.analyser.frequencyBinCount);
        audio.analyser.getByteFrequencyData(spectrums);


        for(var i=0, len=spectrums.length; i<len; i++){
            //color
            if( 85 > spectrums[i] ){
                canvasContext.fillStyle = '#'+_b+_r+_g;
            }else{
                if( 85 <= spectrums[i] && spectrums[i] < 170){
                    canvasContext.fillStyle = '#'+_g+_b+_r;
                }else{
                    if( spectrums[i] >= 170 ){
                        canvasContext.fillStyle = '#'+_r+_g+_b;
                    }
                }
            }
            var BarHeight = spectrums[i];
            canvasContext.fillRect(i*2+10, height-BarHeight, 1, BarHeight*2);
        }//for


        }
        window.animationId = window.requestAnimationFrame(lineRender);
    }//render

    lineRender();



});

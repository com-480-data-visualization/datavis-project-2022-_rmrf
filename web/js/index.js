

$(document).ready(function() {
    var controller = new ScrollMagic.Controller();


    function pathPrepare ($el) {
        var lineLength = $el[0].getTotalLength();
        $el.css("stroke-dasharray", lineLength);
        $el.css("stroke-dashoffset", lineLength);
    }

    var $annim = $("#annim");

    // prepare SVG
    pathPrepare($annim);

    // build tween
    var tween = new TimelineMax()
        .add(TweenMax.to($annim, 1, {strokeDashoffset: 0, ease:Linear.easeNone}))
        .add(TweenMax.to("path#annim", 1, {stroke: "#33629c", ease:Linear.easeNone}), 0);
    // build scene
    var scene = new ScrollMagic.Scene({triggerElement: "#introduction", duration: 100, tweenChanges: true})
        .setTween(tween)

    var scene1 = new ScrollMagic.Scene({
        triggerElement: '#part1'
    }).setClassToggle('#part1', 'fade-in');

    var scene2 = new ScrollMagic.Scene({
        triggerElement: '#part2'
    }).setClassToggle('#part3', 'fade-in');


    // Add Scene to ScrollMagic Controller
    controller.addScene([
        scene,
        scene1,
        scene2,
    ]);
});
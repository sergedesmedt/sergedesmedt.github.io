function RegisterRaphael(raphaelPaper) {

    raphaelPaper.customAttributes.shrapnel = function (g) {
        return { shrapnel: g };
    }

    raphaelPaper.customAttributes.guide = function (g) {
        return { guide: g };
    }

    raphaelPaper.customAttributes.along = function (percent) {
        var guide = this.attr("guide");
        var guideLength = guide.getTotalLength();
        var currentPoint = guide.getPointAtLength(percent * guideLength);
        //console.log("animate to point x:"+currentPoint.x+", y:"+currentPoint.y);
        var animationTarget = {
            cx: currentPoint.x,
            cy: currentPoint.y,
            opacity: 1 //(1 - percent)
        }

        return animationTarget;
    }

    raphaelPaper.customAttributes.alongshrapnel = function (percent) {
        //console.log("animate along:" + percent);
        var shrapnel = this.attr("shrapnel");
        shrapnel.forEach(function (e) {
            var guide = e.attr("guide");
            var guideLength = guide.getTotalLength();
            var currentPoint = guide.getPointAtLength(percent * guideLength);
            //console.log("animate to point x:" + currentPoint.x + ", y:" + currentPoint.y);
            e.attr({ cx: currentPoint.x, cy: currentPoint.y });
            //var animationTarget = {
            //    cx: currentPoint.x,
            //    cy: currentPoint.y
            //}
        });

        //return animationTarget;
    }

}


function Rocket(xPos, yPos, configuration, debug, debugText) {
    var pathOpacity = debug;
    var debugTextSpan = debugText;

    //debugTextSpan.html("creation");

    var rocketRadius = 5;
    var shardRadius = 5;
    var rocketExpansionRadius = 20;
    var explosionExpansionRadius = 25;
    var explosionShrapnelExpansionRadius = 75;

    var animationStepDuration = 700;
    var shootDuration = animationStepDuration;                          // what is the duration of the launching
    var rocketExpansionDuration = animationStepDuration;                // what is the duration of the expansion of the rocket, without exploding
    var explosionExpansionDuration = animationStepDuration;             // what is the duration of the explosion, without bursting into shrapnel
    var explosionShrapnelExpansionDuration = animationStepDuration;     // What is the duration of the fallout of the shrapnel
    var shootingHeight = 200;

    var shrapnelCount = 28;
    var nonPathShrapnelLifetime = explosionShrapnelExpansionDuration / 2;
    var pathShrapnelLifetime = 0;                                       // What is the duration of the shrapnel once it is on the path
    var pathShrapnelFadeOutDuration = 100;

    var animationEndedAction = function () { };

    if (configuration != undefined) {
        rocketRadius = configuration.RocketRadius;
        shardRadius = configuration.ShardRadius;
        rocketExpansionRadius = configuration.RocketExpansionRadius;
        explosionExpansionRadius = configuration.ExplosionExpansionRadius;
        explosionShrapnelExpansionRadius = configuration.ExplosionShrapnelExpansionRadius;
        shootDuration = configuration.ShootDuration;
        rocketExpansionDuration = configuration.RocketExpansionDuration;
        explosionExpansionDuration = configuration.ExplosionExpansionDuration;
        explosionShrapnelExpansionDuration = configuration.ExplosionShrapnelExpansionDuration;
        nonPathShrapnelLifetime = configuration.NonPathShrapnelLifetime;
        shrapnelCount = configuration.ShrapnelCount;
        pathShrapnelLifetime = configuration.PathShrapnelLifetime;
        shootingHeight = configuration.ShootingHeight;
        animationEndedAction = configuration.AnimationEndedAction;
        pathShrapnelFadeOutDuration = configuration.PathShrapnelFadeOutDuration;
    }

    var numberOfAnimationsEnded = 0;

    var partEndedAction = function () {
        numberOfAnimationsEnded++;
        //console.log("a part ended " + numberOfAnimationsEnded + " of " + shrapnelCount);
        if (numberOfAnimationsEnded == shrapnelCount)
        {
            //console.log("a part ended " + numberOfAnimationsEnded + " of " + shrapnelCount);
            animationEndedAction();
        }
    }

    var xInitPos = xPos;
    var yInitPos = yPos;

    var xPosition = xInitPos;
    var yPosition = yInitPos - shootingHeight;

    var launchStyle = {
        "fill": "#FFFFFF",
        "stroke": "#000000",
        "stroke-width": 2
    }

    var explosionStyle = {
        "fill": "#FF0000",
        "stroke": "#660000",
        "stroke-width": 1
    }

    var circle = paper.circle(xInitPos, yInitPos, rocketRadius).attr(launchStyle);

    var positionAnimation = Raphael.animation({
        "cx": xPosition,
        "cy": yPosition
    }, shootDuration, 'easeOut');

    var exlosionAnimation = Raphael.animation({
        "r": (rocketExpansionRadius),
        "fill": "#FF0000",
        "stroke": "#660000"
    }, rocketExpansionDuration, 'easeOut', function () {
        //debugTextSpan.html("explosionFadeOut");

        this.animate(explosionFadeOut);
    });

    var explosionFadeOut = Raphael.animation({
        "r": (explosionExpansionRadius),
        "fill": "#FFFFFF",
        "stroke": "#FFFFFF"
    }, explosionExpansionDuration, 'easeOut', endAnimation);

    function internalSign(x) {
        if (+x === x) { // check if a number was given
            return (x === 0) ? x : (x > 0) ? 1 : -1;
        }
        return NaN;
    }

    function defaultTargetAnimation() {
        var count = shrapnelCount;
        var angleSpacing = (2 * Math.PI) / count;

        paper.setStart();
        for (i = 0; i < count; i++) {
            var shrapnelCircle = paper.circle(xPosition, yPosition, shardRadius);
        }
        var explosionSet = paper.setFinish();

        explosionSet.attr(explosionStyle);

        console.log("remove circle");
        circle.remove();
        circle = null;

        var explosionIndex = 0;
        explosionSet.forEach(function (e) {
            var elem = e;
            var shrapnelAngle = explosionIndex * angleSpacing;
            var shrapnelRadius = explosionShrapnelExpansionRadius;

            var centerPt = xPosition + ", " + yPosition;
            var startX = xPosition + (shrapnelRadius * Math.cos(shrapnelAngle));
            var startY = yPosition + (shrapnelRadius * Math.sin(shrapnelAngle));
            var toX = startX + (shrapnelRadius * Math.cos(shrapnelAngle));
            var toY = startY + (shrapnelRadius * Math.sin(shrapnelAngle));
            var ctrlP2XDelta = (internalSign(Math.sin(shrapnelAngle)) < 0) ? ((internalSign(Math.cos(shrapnelAngle))) * 50) : (shrapnelRadius * Math.cos(shrapnelAngle));
            var ctrlP2YDelta = (internalSign(Math.sin(shrapnelAngle)) < 0) ? 0 : (shrapnelRadius * Math.sin(shrapnelAngle));

            //console.log(explosionIndex + ", " + internalSign(Math.sin(shrapnelAngle)) + ", " + ctrlP2YDelta);

            //https://www.safaribooksonline.com/library/view/raphaeljs/9781449365356/ch04.html
            var startPt = startX + ", " + startY;
            var ctrlP1 = toX + "," + toY + " ";
            var ctrlP2 = (toX + ctrlP2XDelta) + "," + (toY + ctrlP2YDelta) + " ";
            var endP = (toX + ctrlP2XDelta) + "," + (toY + ctrlP2YDelta + yInitPos)



            //paper.circle(startX, startY, 2).attr({"fill":"green"});
            //paper.circle(toX, toY, 2).attr({"fill":"blue"});
            //paper.circle((toX + ctrlP2XDelta), (toY + ctrlP2YDelta), 2).attr({"fill":"yellow"});
            //paper.circle((toX + ctrlP2XDelta), (toY + ctrlP2YDelta + 300), 2).attr({"fill":"brown"});

            var pathString =
                "M " + centerPt +
                "L " + startPt +
                "M " + startPt +
                " C " +
                ctrlP1 +
                ctrlP2 +
                endP;

            //console.log(pathString);
            var path = paper.path(pathString).attr({ "opacity": pathOpacity });
            var duration = explosionShrapnelExpansionDuration; // * path.getTotalLength() / shrapnelRadius; // WTF was I thinking ????
            var pathSection = nonPathShrapnelLifetime / explosionShrapnelExpansionDuration;

            e.attr({
                guide: path,
                along: 0
            });

            e.animate({
                along: pathSection,
                r: 0
            }, duration, 'easeOut', partEndedAction);

            explosionIndex++;
        });
    }

    function pathTargetAnimation() {
        var count = shrapnelCount;
        var angleSpacing = (2 * Math.PI) / count;

        paper.setStart();
        for (i = 0; i < count; i++) {
            var shrapnelCircle = paper.circle(xPosition, yPosition, shardRadius);
        }
        var explosionSet = paper.setFinish();

        explosionSet.attr(explosionStyle);

        console.log("remove circle");
        circle.remove();
        circle = null;

        var explosionIndex = 0;
        var pathStep = targetPath.getTotalLength() / count;
        explosionSet.forEach(function (e) {
            var elem = e;

            var shrapnelAngle = explosionIndex * angleSpacing;
            var shrapnelRadius = explosionShrapnelExpansionRadius;

            var centerPt = xPosition + ", " + yPosition;
            var startX = xPosition + (shrapnelRadius * Math.cos(shrapnelAngle));
            var startY = yPosition + (shrapnelRadius * Math.sin(shrapnelAngle));
            var toX = startX + (shrapnelRadius * Math.cos(shrapnelAngle));
            var toY = startY + (shrapnelRadius * Math.sin(shrapnelAngle));
            var ctrlP2XDelta = (internalSign(Math.sin(shrapnelAngle)) < 0) ? ((internalSign(Math.cos(shrapnelAngle))) * 50) : (shrapnelRadius * Math.cos(shrapnelAngle));
            var ctrlP2YDelta = (internalSign(Math.sin(shrapnelAngle)) < 0) ? 0 : (shrapnelRadius * Math.sin(shrapnelAngle));

            var endPoint = targetPath.getPointAtLength(explosionIndex * pathStep);

            //console.log(explosionIndex + ", " + internalSign(Math.sin(shrapnelAngle)) + ", " + ctrlP2YDelta);

            //https://www.safaribooksonline.com/library/view/raphaeljs/9781449365356/ch04.html
            var startPt = startX + ", " + startY;
            var ctrlP1 = toX + "," + toY + " ";
            var ctrlP2 = (toX + ctrlP2XDelta) + "," + (toY + ctrlP2YDelta) + " ";
            //var endP = (toX + ctrlP2XDelta) + "," + (toY + ctrlP2YDelta + yInitPos)
            var endP = endPoint.x + "," + endPoint.y;
            var endRadius = shardRadius;

            //var fadeOutAnimation = function () {
            //    explosionSet.forEach(function (e) {
            //        var animateOpacity = Raphael.animation({
            //            opacity: 0
            //        }, duration, 'easeOut');
            //        e.animate(animateOpacity.delay(pathShrapnelLifetime), partEndedAction);
            //    });
            //};

            var fadeOutAnimation = function () {
                var animateOpacity = Raphael.animation({
                    opacity: 0
                }, pathShrapnelFadeOutDuration, 'easeOut');
                e.animate(animateOpacity.delay(pathShrapnelLifetime), partEndedAction);
            };


            var pathString =
                "M " + centerPt +
                "L " + startPt +
                "M " + startPt +
                " C " +
                ctrlP1 +
                ctrlP2 +
                endP;

            //console.log(pathString);
            var path = paper.path(pathString).attr({ "opacity": pathOpacity });

            e.attr({
                guide: path
            });

            explosionIndex++;
        });

        circle.attr({
            alongshrapnel: 0,
            shrapnel: explosionSet
        });

        var duration = explosionShrapnelExpansionDuration; // * path.getTotalLength() / shrapnelRadius;

        circle.animate({
            alongshrapnel: 1
        }, duration, 'easeOut', fadeOutAnimation);

    }

    function sectionPathTargetAnimation() {
        //debugTextSpan.html("sectionPathTargetAnimation");


        // create all the shrapnel
        var count = shrapnelCount;
        var angleSpacing = (2 * Math.PI) / count;

        paper.setStart();
        for (i = 0; i < count; i++) {
            var shrapnelCircle = paper.circle(xPosition, yPosition, shardRadius);
        }
        var explosionSet = paper.setFinish();

        explosionSet.attr(explosionStyle);

        var explosionIndex = 0;

        console.log("remove circle");
        circle.remove();
        circle = null;

        // calculate the arc that will animate into the path

        var startCount = Math.ceil(startRingAngle / angleSpacing);
        var endCount = Math.floor(endRingAngle / angleSpacing);

        var startOffset = targetPath.getTotalLength() * startTargetPath;
        var pathStep = ((targetPath.getTotalLength() * endTargetPath) - startOffset) / (endCount - startCount);

        //debugTextSpan.html("explosionSet.forEach");
        explosionSet.forEach(function (e) {
            //debugTextSpan.html("[" + explosionIndex + "]explosionSet.forEach");
            try {
                //debugTextSpan.html("[" + explosionIndex + "]trying");
                var elem = e;


                var shrapnelAngle = explosionIndex * angleSpacing;
                var shrapnelRadius = explosionShrapnelExpansionRadius;

                //debugTextSpan.html("[" + explosionIndex + "] calc");

                //calculate some intermediate points
                var centerPt = xPosition + ", " + yPosition;
                var startX = xPosition + (shrapnelRadius * Math.cos(shrapnelAngle));
                var startY = yPosition + (shrapnelRadius * Math.sin(shrapnelAngle));
                var toX = startX + (shrapnelRadius * Math.cos(shrapnelAngle));
                var toY = startY + (shrapnelRadius * Math.sin(shrapnelAngle));
                var ctrlP2XDelta = (internalSign(Math.sin(shrapnelAngle)) < 0) ? ((internalSign(Math.cos(shrapnelAngle))) * 50) : (shrapnelRadius * Math.cos(shrapnelAngle));
                var ctrlP2YDelta = (internalSign(Math.sin(shrapnelAngle)) < 0) ? 0 : (shrapnelRadius * Math.sin(shrapnelAngle));

                //https://www.safaribooksonline.com/library/view/raphaeljs/9781449365356/ch04.html
                var startPt = startX + ", " + startY;
                var ctrlP1 = toX + "," + toY + " ";
                var ctrlP2 = (toX + ctrlP2XDelta) + "," + (toY + ctrlP2YDelta) + " ";
                var endP = (toX + ctrlP2XDelta) + "," + (toY + ctrlP2YDelta + yInitPos)

                var endRadius = 0;
                var pathSection = nonPathShrapnelLifetime / explosionShrapnelExpansionDuration;
                var duration = nonPathShrapnelLifetime;
                var fadeOutAnimation = function () { partEndedAction(); };
                var shrapnelAngle = explosionIndex * angleSpacing;
                if (shrapnelAngle < startRingAngle || shrapnelAngle > endRingAngle) {
                    // do not animate to the path
                }
                else {
                    // animate to the path
                    duration = explosionShrapnelExpansionDuration; // * path.getTotalLength() / shrapnelRadius;

                    var endPoint = targetPath.getPointAtLength(startOffset + (explosionIndex - startCount) * pathStep);
                    endP = endPoint.x + "," + endPoint.y;
                    endRadius = shardRadius;
                    pathSection = 1;

                    fadeOutAnimation = function () {
                        var animateOpacity = Raphael.animation({
                            opacity: 0
                        }, pathShrapnelFadeOutDuration, 'easeOut', partEndedAction);
                        e.animate(animateOpacity.delay(pathShrapnelLifetime));
                    }
                }

                var pathString =
                    "M " + centerPt +
                    "L " + startPt +
                    "M " + startPt +
                    " C " +
                    ctrlP1 +
                    ctrlP2 +
                    endP;

                var path = paper.path(pathString).attr({ "opacity": pathOpacity });

                elem.attr({
                    guide: path,
                    along: 0
                });

                //debugTextSpan.html("[" + explosionIndex + "] animate elem");

                elem.animate({
                    along: pathSection,
                    r: endRadius
                }, duration, 'easeOut', fadeOutAnimation);

            }
            catch (err)
            {
                //debugTextSpan.html("[" + explosionIndex + "]fe err: " + err.message);
            }

            explosionIndex++;
        });
    }

    function endAnimation() {
        if (mode == 0) {
            defaultTargetAnimation();
        }
        if (mode == 1) {
            pathTargetAnimation();
        }
        if (mode == 2) {
            sectionPathTargetAnimation();
        }
    }

    var mode = 0;

    this.explode = function (startDelay) {
        circle.animate(positionAnimation.delay(startDelay));
        circle.animate(exlosionAnimation.delay(startDelay + shootDuration));
    }

    var targetPath;

    this.explodeToPath = function (startDelay, path) {
        mode = 1;
        targetPath = path;
        circle.animate(positionAnimation.delay(startDelay));
        circle.animate(exlosionAnimation.delay(startDelay + shootDuration));
    }

    var startTargetPath;
    var endTargetPath;
    var startRingAngle;
    var endRingAngle;

    this.explodeToPathSection = function (startDelay, path, startPathOffset, endPathOffset, startAngle, endAngle) {
        mode = 2;
        targetPath = path;
        startTargetPath = startPathOffset;
        endTargetPath = endPathOffset;
        startRingAngle = startAngle;
        endRingAngle = endAngle;
        circle.animate(positionAnimation.delay(startDelay));
        circle.animate(exlosionAnimation.delay(startDelay + shootDuration));
    }

}


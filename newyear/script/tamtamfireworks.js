function RegisterRaphael(raphaelPaper) {
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

}


function Rocket(xPos, yPos, configuration, debug, debugText) {
    var pathOpacity = debug;
    var debugTextSpan = debugText;

    debugText.html("creation");

    var rocketRadius = 5;
    var shardRadius = 5;
    var rocketExpansionRadius = 20;
    var explosionExpansionRadius = 25;
    var explosionShrapnelExpansionRadius = 75;

    var animationStepDuration = 700;
    var shootDuration = animationStepDuration;                          // what is the duration of the launching
    var rocketExpansionDuration = animationStepDuration;                // what is the duration of the expansion of the rocket, without exploding
    var explosionExpansionDuration = animationStepDuration;             // what is the duration of the explosion, without bursting into shrapnel
    var explosionShrapnelExpansionDuration = animationStepDuration;     
    var shootingHeight = 200;

    var shrapnelCount = 28;
    var nonPathShrapnelLifetime = explosionShrapnelExpansionDuration / 2;
    var pathShrapnelLifetime = 0;

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
        debugText.html("explosionFadeOut");

        this.animate(explosionFadeOut);
    });

    var explosionFadeOut = Raphael.animation({
        "r": (explosionExpansionRadius),
        "fill": "#FFFFFF",
        "stroke": "#FFFFFF"
    }, explosionExpansionDuration, 'easeOut', endAnimation);

    function defaultTargetAnimation() {
        var count = shrapnelCount;
        var angleSpacing = (2 * Math.PI) / count;

        paper.setStart();
        for (i = 0; i < count; i++) {
            var circle = paper.circle(xPosition, yPosition, shardRadius);
        }
        var explosionSet = paper.setFinish();

        explosionSet.attr(explosionStyle);

        var explosionIndex = 0;
        explosionSet.forEach(function (e) {
            var shrapnelAngle = explosionIndex * angleSpacing;
            var shrapnelRadius = explosionShrapnelExpansionRadius;

            var centerPt = xPosition + ", " + yPosition;
            var startX = xPosition + (shrapnelRadius * Math.cos(shrapnelAngle));
            var startY = yPosition + (shrapnelRadius * Math.sin(shrapnelAngle));
            var toX = startX + (shrapnelRadius * Math.cos(shrapnelAngle));
            var toY = startY + (shrapnelRadius * Math.sin(shrapnelAngle));
            var ctrlP2XDelta = (Math.sign(Math.sin(shrapnelAngle)) < 0) ? ((Math.sign(Math.cos(shrapnelAngle))) * 50) : (shrapnelRadius * Math.cos(shrapnelAngle));
            var ctrlP2YDelta = (Math.sign(Math.sin(shrapnelAngle)) < 0) ? 0 : (shrapnelRadius * Math.sin(shrapnelAngle));

            //console.log(explosionIndex + ", " + Math.sign(Math.sin(shrapnelAngle)) + ", " + ctrlP2YDelta);

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
            var elem = e;
            var duration = explosionShrapnelExpansionDuration * path.getTotalLength() / shrapnelRadius; // WTF was I thinking ????
            var pathSection = nonPathShrapnelLifetime / explosionShrapnelExpansionDuration;

            // Animate along a path
            // https://www.safaribooksonline.com/library/view/learning-raphael-js/9781782169161/ch05s05.html
            // http://stackoverflow.com/questions/13295656/raphaeljs-2-1-animate-along-path
            // https://github.com/DmitryBaranovskiy/raphaeljs.com/blob/master/gear.html
            // https://dmitrybaranovskiy.github.io/raphael/reference.html#Paper.customAttributes

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
            var circle = paper.circle(xPosition, yPosition, shardRadius);
        }
        var explosionSet = paper.setFinish();

        explosionSet.attr(explosionStyle);

        var explosionIndex = 0;
        var pathStep = targetPath.getTotalLength() / count;
        explosionSet.forEach(function (e) {
            var shrapnelAngle = explosionIndex * angleSpacing;
            var shrapnelRadius = explosionShrapnelExpansionRadius;

            var centerPt = xPosition + ", " + yPosition;
            var startX = xPosition + (shrapnelRadius * Math.cos(shrapnelAngle));
            var startY = yPosition + (shrapnelRadius * Math.sin(shrapnelAngle));
            var toX = startX + (shrapnelRadius * Math.cos(shrapnelAngle));
            var toY = startY + (shrapnelRadius * Math.sin(shrapnelAngle));
            var ctrlP2XDelta = (Math.sign(Math.sin(shrapnelAngle)) < 0) ? ((Math.sign(Math.cos(shrapnelAngle))) * 50) : (shrapnelRadius * Math.cos(shrapnelAngle));
            var ctrlP2YDelta = (Math.sign(Math.sin(shrapnelAngle)) < 0) ? 0 : (shrapnelRadius * Math.sin(shrapnelAngle));

            var endPoint = targetPath.getPointAtLength(explosionIndex * pathStep);

            //console.log(explosionIndex + ", " + Math.sign(Math.sin(shrapnelAngle)) + ", " + ctrlP2YDelta);

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
                }, duration, 'easeOut');
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
            var elem = e;
            var duration = explosionShrapnelExpansionDuration * path.getTotalLength() / shrapnelRadius;

            // Animate along a path
            // https://www.safaribooksonline.com/library/view/learning-raphael-js/9781782169161/ch05s05.html
            // http://stackoverflow.com/questions/13295656/raphaeljs-2-1-animate-along-path
            // https://github.com/DmitryBaranovskiy/raphaeljs.com/blob/master/gear.html
            // https://dmitrybaranovskiy.github.io/raphael/reference.html#Paper.customAttributes

            e.attr({
                guide: path,
                along: 0
            });

            e.animate({
                along: 1,
                r: endRadius
            }, duration, 'easeOut', fadeOutAnimation);

            explosionIndex++;
        });
    }

    function sectionPathTargetAnimation() {
        debugText.html("sectionPathTargetAnimation");

        var count = shrapnelCount;
        var angleSpacing = (2 * Math.PI) / count;

        paper.setStart();
        for (i = 0; i < count; i++) {
            var circle = paper.circle(xPosition, yPosition, shardRadius);
        }
        var explosionSet = paper.setFinish();

        explosionSet.attr(explosionStyle);

        var explosionIndex = 0;

        var startCount = Math.ceil(startRingAngle / angleSpacing);
        var endCount = Math.floor(endRingAngle / angleSpacing);

        var startOffset = targetPath.getTotalLength() * startTargetPath;
        var pathStep = ((targetPath.getTotalLength() * endTargetPath) - startOffset) / (endCount - startCount);

        explosionSet.forEach(function (e) {
            var shrapnelAngle = explosionIndex * angleSpacing;
            var shrapnelRadius = explosionShrapnelExpansionRadius;

            var centerPt = xPosition + ", " + yPosition;
            var startX = xPosition + (shrapnelRadius * Math.cos(shrapnelAngle));
            var startY = yPosition + (shrapnelRadius * Math.sin(shrapnelAngle));
            var toX = startX + (shrapnelRadius * Math.cos(shrapnelAngle));
            var toY = startY + (shrapnelRadius * Math.sin(shrapnelAngle));
            var ctrlP2XDelta = (Math.sign(Math.sin(shrapnelAngle)) < 0) ? ((Math.sign(Math.cos(shrapnelAngle))) * 50) : (shrapnelRadius * Math.cos(shrapnelAngle));
            var ctrlP2YDelta = (Math.sign(Math.sin(shrapnelAngle)) < 0) ? 0 : (shrapnelRadius * Math.sin(shrapnelAngle));

            //https://www.safaribooksonline.com/library/view/raphaeljs/9781449365356/ch04.html
            var startPt = startX + ", " + startY;
            var ctrlP1 = toX + "," + toY + " ";
            var ctrlP2 = (toX + ctrlP2XDelta) + "," + (toY + ctrlP2YDelta) + " ";
            var endP = (toX + ctrlP2XDelta) + "," + (toY + ctrlP2YDelta + yInitPos)

            var endRadius = 0;
            var pathSection = nonPathShrapnelLifetime / explosionShrapnelExpansionDuration;
            var fadeOutAnimation = function () { partEndedAction(); };
            var shrapnelAngle = explosionIndex * angleSpacing;
            if (shrapnelAngle < startRingAngle || shrapnelAngle > endRingAngle) {
            }
            else {
                var endPoint = targetPath.getPointAtLength(startOffset + (explosionIndex - startCount) * pathStep);
                endP = endPoint.x + "," + endPoint.y;
                endRadius = shardRadius;
                pathSection = 1;

                //fadeOutAnimation = function () {
                //    explosionSet.forEach(function (e) {
                //        var animateOpacity = Raphael.animation({
                //            opacity: 0
                //        }, duration, 'easeOut', partEndedAction);
                //        e.animate(animateOpacity.delay(pathShrapnelLifetime));
                //    });
                //}

                fadeOutAnimation = function () {
                    var animateOpacity = Raphael.animation({
                        opacity: 0
                    }, duration, 'easeOut', partEndedAction);
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
            var elem = e;
            var duration = explosionShrapnelExpansionDuration * path.getTotalLength() / shrapnelRadius;

            // Animate along a path
            // https://www.safaribooksonline.com/library/view/learning-raphael-js/9781782169161/ch05s05.html
            // http://stackoverflow.com/questions/13295656/raphaeljs-2-1-animate-along-path
            // https://github.com/DmitryBaranovskiy/raphaeljs.com/blob/master/gear.html
            // https://dmitrybaranovskiy.github.io/raphael/reference.html#Paper.customAttributes

            e.attr({
                guide: path,
                along: 0
            });

            e.animate({
                along: pathSection,
                r: endRadius
            }, duration, 'easeOut', fadeOutAnimation);

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


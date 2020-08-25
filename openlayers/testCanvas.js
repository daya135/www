function DrawReport(ctx, line, reports, img) {
    let width = 15; //图像宽度的一半
    let rotate;
    let start = line[0];
    let end = line[1];
    console.log('start, end', start, end);

    if(start[0] == end[0]) {
        if(end[1] > start[1]) {
            rotate = Math.PI / 2; //顺时针旋转90度
        } else {
            rotate = Math.PI * 3 / 2; //顺时针旋转270度
        }
    } else if(start[1] == end[1]) {
        if(end[0] > start[0]) {
            rotate = 0;
        } else {
            rotate = Math.PI;
        }
    } else {
        rotate = Math.atan((end[1] - start[1]) / (end[0] - start[0]));
        //因为atan的周期是π，需要调整一三象限的角度值
        if(((end[1] - start[1]) < 0 && rotate > 0) || ((end[1] - start[1]) > 0 && rotate < 0)) {
            rotate = rotate + Math.PI;
        }
    }
    let centerx = start[0] + (end[0] - start[0]) / 2;
    let centery = start[1] + (end[1] - start[1]) / 2;
    console.log('centerx, centery', centerx, centery);
    let length = Math.sqrt(Math.pow(start[0] - end[0], 2) + Math.pow(start[1] - end[1], 2));
    if(length >= width * 2) {
        offx = width * Math.cos(rotate); //浮点数精度问题只影响比较，不影响计算，实际测试效果也一样！
        offy = width * Math.sin(rotate);
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#000000";
        drawLine(ctx, [start, [centerx - offx, centery - offy]]);
        drawLine(ctx, [
            [centerx + offx, centery + offy], end
        ]);
    }

    ctx.save();
    ctx.translate(centerx, centery);
    ctx.rotate(rotate);
    ctx.drawImage(img, -width, -width, width * 2, width * 2);
    ctx.restore();
}

function drawLine(ctx, line) {
    ctx.beginPath(); //必须加，否则会出现一些不明边框
    ctx.moveTo(line[0][0], line[0][1]);
    for(let i = 1; i < line.length; i++) {
        ctx.lineTo(line[i][0], line[i][1]);
    }
    ctx.stroke();
    ctx.closePath();
}

function drawLineArea(ctx, line, rightFlag) {
    if(line.length < 2) {
        return;
    }
    let width = 8; //线宽的一半
    ctx.save();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000000";
    drawLine2(ctx, line);
    ctx.restore();

    ctx.beginPath();
    ctx.lineWidth = width * 2;
    ctx.strokeStyle = "#3A5FCDBA";
    ctx.lineJoin = "miter";
    for(let i = 1; i < line.length; i++) {
        let start = line[i - 1];
        let end = line[i];
        let offx = 0;
        let offy = 0;
        if(start[0] == end[0]) {
            //                      offy = 0;
            if(end[1] > start[1]) {
                rotate = Math.PI / 2; //顺时针旋转90度
                //                          offx = width;
            } else {
                rotate = Math.PI * 3 / 2; //顺时针旋转270度
                //                          offx = -width;
            }
        } else if(start[1] == end[1]) {
            //                      offx = 0;
            if(end[0] > start[0]) {
                rotate = 0;
                //                          offy = width;
            } else {
                rotate = Math.PI;
                //                          offy = - width;
            }
        } else {
            rotate = Math.atan((end[1] - start[1]) / (end[0] - start[0]));
            //因为atan的周期是π，需要调整一三象限的角度值
            if(((end[1] - start[1]) < 0 && rotate > 0) || ((end[1] - start[1]) > 0 && rotate < 0)) {
                rotate = rotate + Math.PI;
            }
            //                      offx = width * Math.sin(rotate);
            //                      offy = width * Math.cos(rotate);
        }
        offx = width * Math.sin(rotate); //浮点数精度问题只影响比较，不影响计算，实际测试效果也一样！
        offy = width * Math.cos(rotate);
        if(rightFlag = false) {
            if(i == 1) {
                ctx.moveTo(start[0] + offx, start[1] - width * offy);
            }
            ctx.lineTo(end[0] + offx, end[1] - offy);
        } else {
            if(i == 1) {
                ctx.moveTo(start[0] - offx, start[1] + offy);
            }
            ctx.lineTo(end[0] - offx, end[1] + offy);
        }
        console.log(rotate, offx, offy);
        console.log(rotate, width * Math.sin(rotate), width * Math.cos(rotate))
    }
    ctx.stroke();
    ctx.closePath();
}

function drawLineImg(ctx, line, img) {
    let step = 30;
    for(let i = 1; i < line.length; i++) {
        let start = line[i - 1];
        let end = line[i];
        let rotate;
        let offx;
        let offy
        if(start[0] == end[0]) {
            offx = 0;
            if(end[1] > start[1]) {
                rotate = Math.PI / 2; //顺时针旋转90度
                offy = step / 2
            } else {
                rotate = Math.PI * 3 / 2; //顺时针旋转270度
                offy = -1 * step / 2
            }
        } else if(start[1] == end[1]) {
            offy = 0;
            if(end[0] > start[0]) {
                rotate = 0;
                offx = step / 2;
            } else {
                rotate = Math.PI;
                offx = -1 * step / 2;
            }
        } else {
            rotate = Math.atan((end[1] - start[1]) / (end[0] - start[0]));
            offx = Math.cos(rotate) * step / 2;
            offy = Math.sin(rotate) * step / 2;
            if(((end[1] - start[1]) < 0 && rotate > 0) || ((end[1] - start[1]) > 0 && rotate < 0)) {
                console.log('进入到二三象限', rotate / Math.PI);
                offx = -offx;
                offy = -offy;
            }
        }
        console.log(offx, offy, rotate, Math.sin(rotate));
        let x = start[0];
        let y = start[1];
        let l = Math.sqrt(Math.pow(start[1] - end[1], 2) + Math.pow(start[0] - end[0], 2));
        let s = 1;
        //交替旋转180度画出扇区图标
        for(let i = 0; i < l - (step / 2); i += step) {
            let ox = offx * (Math.ceil(i / step * 2) + 1);
            let oy = offy * (Math.ceil(i / step * 2) + 1);
            ctx.save();
            ctx.translate(x + ox, y + oy);
            ctx.rotate(rotate);
            ctx.drawImage(img, -step / 2, -step / 2, step, step);
            ctx.restore();
            s = -s;
            rotate += Math.PI * s;
        }
    }
}
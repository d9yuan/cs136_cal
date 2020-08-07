var fs = require("fs");
angular.module('marksApp', [])
    .controller('MarksController', function () {
        var marksList = this;
        marksList.determineTNA = function () {
            var t = parseInt(document.getElementById("changeTNA").value);
            if (isNaN(t)) t = 9;
            var k = t;
            while (k < marksList.marks.length - 1) {
                marksList.archive();
                k++;
            }
            return t;
        }
        marksList.marks = [
            {text: "midterm"},
            { text: "a1"},
            { text: "a2"},
            { text: "a3"},
            { text: "a4"},
            { text: "a5"},
        ];
        writeTest = function() {
            
        }
        marksList.addAssignment = function () {
            if (marksList.marks.length > marksList.determineTNA()) return;
            if (marksList.marks.length == 0){
                marksList.marks.push({ text: "midterm"});
                return;
            }
            var textval = "a" + (marksList.marks.length);
            marksList.marks.push({ text: textval});
            marksList.markText = '';
        };


        marksList.archive = function () {
            marksList.marks.splice(marksList.marks.length-1, 1);
        };
        function show_text(){
            var x = document.getElementById("actual_text");
            if (x.style.display === "none") {
                x.style.display = "block";
            }
        }

        marksList.passAsgmt = 0;
        marksList.passExam = 0;
        marksList.currentAssignmentN = 0;
        marksList.currentAssignmentAverage = 0;
        marksList.totalAssignmentN = 9;
        marksList.remainingAssignmentN = 9;
        marksList.finalAim = 0;
        marksList.assignmentAim = 0;
        marksList.aimming = 50;
        marksList.participation = 5;
        marksList.calculate = function () {
            show_text();
            var aim = parseFloat(document.getElementById("expect").value);
            aim = !isNaN(aim) ? aim : 50;
            var participation = parseFloat(document.getElementById("participation").value);
            participation = !isNaN(participation) ? participation : 5;
            marksList.aimming = aim;
            marksList.participation = participation;
            
            marksList.totalAssignmentN = marksList.determineTNA();
            // pass_assignment
            var list = [];
            for (i = 1; i < marksList.marks.length; i++){
                var ele = parseFloat(document.getElementById(marksList.marks[i].text).value);
                if (!isNaN(ele))list.push(ele);
            } 
            marksList.currentAssignmentN = list.length > 0 ? list.length : 0;
            var sum = 0;
            var total = marksList.determineTNA();
            for (k = 0; k < list.length; k++){
                sum += list[k];
            }
            marksList.remainingAssignmentN = total - list.length;
            marksList.currentAssignmentAverage = list.length > 0 ? sum / list.length : 0;
            var result = list.length != total ? (total * 50 - sum) / (total - list.length) : 0;
            marksList.passAsgmt = !isNaN(result) ? ((result > 0) ? result : 0) : 0;
            // pass_exam
            var midterm_mark = parseFloat(document.getElementById("midterm").value);
            midterm_mark = !isNaN(midterm_mark) ? midterm_mark : 0;
            var exam = (150 - midterm_mark) / 2;
            marksList.passExam = !isNaN(exam) ? ((exam > 0) ? exam : 0) : 0;
            // aimming for and options

            var sel = document.getElementById("preference");
            var sel_val = sel.options[sel.selectedIndex].value;
            if (sel_val == "final") { // want to achieve expected grades by higher final marks
                if (isNaN(midterm_mark)) window.alert("wtf1");
                var currentMark = 20 * sum / (total * 100) + 25 * (midterm_mark / 100) + participation;
                marksList.finalAim = (aim - currentMark) * 2;
                marksList.finalAim = marksList.finalAim > 0 ? marksList.finalAim : 0;
                if (marksList.finalAim > 100){
                    var r = (marksList.finalAim - 100) / 2;
                    marksList.assignmentAim = marksList.remainingAssignmentN > 0 ? 100 * r / (20 * marksList.remainingAssignmentN / total): 0;
                    marksList.finalAim = 100;
                } else {
                    marksList.assignmentAim = 0;
                }
               
            } else if (sel_val == "asgmt") {
                var currentMark = 20 * sum / (total * 100) + 25 * (midterm_mark / 100) + participation;
                var leftMark = aim - currentMark;
                var RemTotal = leftMark * 5 * total;
                marksList.assignmentAim = RemTotal / marksList.remainingAssignmentN;
                marksList.assignmentAim = marksList.assignmentAim > 0 ? marksList.assignmentAim : 0;
                if (marksList.assignmentAim > 100){
                    var r_asgmt = 20 * marksList.remainingAssignmentN / total;
                    var actual_left = leftMark - r_asgmt;
                    marksList.finalAim = actual_left * 2;
                    marksList.assignmentAim = 100;
                } else {
                    marksList.finalAim = 0;
                }
            } else {
                var currentMark = 20 * sum / (total * 100) + 25 * (midterm_mark / 100) + participation;
                var leftMark = aim - currentMark;
                var r_asgmt = 20 * marksList.remainingAssignmentN / total;
                var x1 = 2 * aim - 2 * currentMark;
                var x2 = - 8 * marksList.remainingAssignmentN / total + 2 * aim - 2 * currentMark;
                
                var upper = x1 > 100 ? 100 : x1;
                var lower = x2 < 0 ? 0 : x2;
                
                var final_mark = Math.floor(Math.random() * (upper - lower + 1)) + lower;

                marksList.finalAim = final_mark > 100 ? 100 : final_mark;
                marksList.assignmentAim = 25 * (x1 - final_mark) * total / (2 * marksList.remainingAssignmentN);
                marksList.assignmentAim = marksList.assignmentAim > 0 ? marksList.assignmentAim : 0;
                marksList.assignmentAim = marksList.assignmentAim > 100 ? 100 : marksList.assignmentAim;
            }
    
            // reduce NaN
            marksList.finalAim = !isNaN(marksList.finalAim) ? marksList.finalAim : 0;
            marksList.assignmentAim = !isNaN(marksList.assignmentAim) ? marksList.assignmentAim : 0;
            // make sure they pass the course
            marksList.finalAim = marksList.finalAim > marksList.passExam ? marksList.finalAim : marksList.passExam;
            marksList.assignmentAim = marksList.assignmentAim > marksList.passAsgmt ? marksList.assignmentAim : marksList.passAsgmt;
            // fix every float to 2 decimal points
            marksList.currentAssignmentAverage = marksList.currentAssignmentAverage.toFixed(2);
            marksList.passAsgmt = marksList.passAsgmt > 0 ? marksList.passAsgmt.toFixed(2) : 0;
            marksList.passExam = marksList.passExam > 0 ? marksList.passExam.toFixed(2) : 0;
            marksList.finalAim = marksList.finalAim > 0 ? marksList.finalAim.toFixed(2) : 0;
            marksList.assignmentAim = marksList.assignmentAim > 0 ? marksList.assignmentAim.toFixed(2) : 0;
        }
    });

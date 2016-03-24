function randInt(lowrange, highrange) {
    return Math.floor((Math.random() + lowrange) * (highrange + 1))
}

/*
 * Basic function to shuffle an array.
 *
 */
function shuffle(array) {
    for (var i=array.length - 1; i > 0; i--) {
        var j = randInt(0, i)
        var temp = array[i]
        array[i] = array[j]
        array[j] = temp
    }
}

/*
 * Perform set subtraction between two arrays
 */
function setSubtraction(array1, array2) {
    var result = new Array();
    
    // find all items in array1 not in array2
    for (var i=0; i<array1.length; i++) {
        var found = false;
        for (var j=0; j<array2.length; j++) {
            if (array1[i] === array2[j]) {
                found = true;
                break;
            }
        }
        if (!found) {
            result.push(array[i]);
        }
    }

    return result;
}

var ExtraLifePoller = function () {
    this.defaultId = 200590
    this.participantId = parseInt(window.location.href.sub(/^.*participantID=(\d+).*/, '$1'))
    if (!this.participantId) this.participantId = this.defaultId
    this.participantUrl = 'http://www.extra-life.org/index.cfm?fuseaction=donorDrive.participant&format=json&participantID=' + this.participantId
    this.donationsUrl = 'http://www.extra-life.org/index.cfm?fuseaction=donorDrive.participantDonations&format=json&participantID=' + this.participantId
    this.donationsReceived = null;
    this.newDonationsReceived = 0;
    this.donationList = [];
    this.newDonationList = [];
    this.xhr1 = new XMLHttpRequest();
    this.xhr2 = new XMLHttpRequest();
    this.xhr1.responseType = 'json'
    this.xhr2.responseType = 'json'
}

ExtraLifePoller.prototype.pollData = function () {
    this.xhr1.open("GET", this.donationsUrl, true)
    var obj = this;

    this.xhr1.addEventListener('load', function() {
        if (obj.xhr1.status == '200') {
            var data = obj.xhr1.response
            obj.newDonationsReceived = data.length
            obj.newDonationList = data
            if (obj.donationsReceived == null) {
                obj.donationsReceived = data.length;
                obj.donationList = data;
            }
            $('#donationsReceivedCount').html(data.length)
            if (obj.newDonationsReceived > obj.donationsReceived) {
                // array returned appears to be sorted by most recent firstChild
                // if I see enough evidence that that holds, it will be much easier
                // to determine what a new donation is.
                obj.triggerAlert(setSubtraction(obj.newDonationList, obj.donationList));
                
                obj.donationsRecieved = obj.newDonationsReceived;
                obj.donationList = obj.newDonationList;
            }
        }
    });
    this.xhr1.send()

    this.xhr2.open("GET", this.participantUrl, true)
    this.xhr2.addEventListener('load', function() {
        if (obj.xhr2.status == '200') {
            var data = obj.xhr2.response
            $('#goal').html(data.fundraisingGoal)
            $('#amountRaised').html(data.totalRaisedAmount)
        }
    });
    this.xhr2.send()
        
    window.setTimeout(function() {ExtraLifePoller.prototype.pollData.call(obj)}, 30000);
}

ExtraLifePoller.prototype.triggerAlert = function (donations) {
    for (var i=0; i<donations.length; i++) {
        alert(donations[i].donorName + ' ' + donations[i].donationAmount + ' ' + donations[i].message)
    }
}

var poller = new ExtraLifePoller();
poller.pollData()
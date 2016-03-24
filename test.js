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

var ExtraLifePoller = function () {
    this.defaultId = 200590
    this.participantId = parseInt(window.location.href.sub(/^.*participantID=(\d+).*/, '$1'))
    if (this.participantId === NaN) this.participantId = this.defaultId
    this.participantUrl = 'http://www.extra-life.org/index.cfm?fuseaction=donorDrive.participant&format=json&participantID=' + this.participantId
    this.donationsUrl = 'http://www.extra-life.org/index.cfm?fuseaction=donorDrive.participantDonations&format=json&participantID=' + this.participantId
    this.donationsReceived = null;
    this.newDonationReceived = 0;
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
            obj.newDonationReceived = data.length
            if (obj.donationsReceived == null) obj.donationsReceived = data.length;
            $('#donationsReceivedCount').html(data.length)
            if (obj.newDonationReceived > obj.donationsReceived) {
                obj.triggerAlert(obj.newDonationReceived);
                obj.donationsRecieved = obj.newDonationReceived;
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

ExtraLifePoller.prototype.triggerAlert = function (count) {
    $('#donationsReceivedCount').html(count)
}

var poller = new ExtraLifePoller();
poller.pollData()
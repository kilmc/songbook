// Function to scrape the selected object for named form inputs
$.fn.serializeObject = function()
{
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};

function load () {
  var content = $(".site-content");
  var addTrackBtn = $(".add-new-track");
  var form;

  // Initiate Hoodie
  var hoodie = new Hoodie();
  hoodie.store.findAll("track").done(allTracks);

  addTrackBtn.click(newTrack);

  function allTracks (tracks) {
    console.log(tracks);
    var index = ich.tracksIndex({
      tracks: tracks
    });
    content.html(index);
  }

  function onSubmit (submit){
    // Prevents page from doing default submit action
    submit.preventDefault();
    console.log("Hello", submit)

    // Define formData variable which is a jSON object created from
    // form objects with names attributes
    var formData = form.serializeObject();

    // Define type to pass to Hoodie.store
    var type = 'track';

    hoodie.store.add(type, formData).done(dataSaved);

    // Return false, beacuse you have to :)
    return false
  }

  function newTrack (submit){
    // Prevents page from doing default submit action
    submit.preventDefault();
    
    var newTrackEl = ich.trackNew();
    console.log(newTrackEl)
    content.html(newTrackEl);
    // When the object of form (.new-song-form) is submitted run the onSubmit function
    // Define form object as a variable
    form = $(".new-song-form");
    form.submit(onSubmit);

    return false
  }

  function dataSaved (newObject) {
    console.log(newObject);
  }
  

  // var index = ich.tracksIndex(user_data_object);
  // var newTrack = ich.trackNew(user_data_object);
  // var editTrack = ich.trackEdit(user_data_object);
  // var track = ich.trackShow(user_data_object);
}

$(document).ready(function() {
  load();
});
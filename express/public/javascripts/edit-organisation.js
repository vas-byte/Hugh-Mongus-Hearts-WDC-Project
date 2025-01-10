window.onload = function() {
    document.querySelector('.add-button').onclick = function() {
        var organisationName = document.getElementById('organisation-name').value;
        var organisationAddress = document.getElementById('organisation-address').value;
        var organisationSuburb = document.getElementById('organisation-suburb').value;
        var organisationState = document.getElementById('organisation-state').value;
        var organisationPostcode = document.getElementById('organisation-postcode').value;
        var organisationManager = document.getElementById('organisation-manager').value;

        // This is where the AJAX request needs to go (POST REQUEST to DB)
    };
};

// Also have a GET request when the page is loaded to fill in pre-existing data
var vueinst = new Vue({
    el: '#app',
    data: {
      organisationID: '',
      organisation: {
        name: '',
        // ... define other properties
      }
    },

    created() {
      // Get the organisation ID from the URL
      var urlParams = new URLSearchParams(window.location.search);
      this.organisationID = urlParams.get('id');
      if (this.organisationID == ''){
        window.location.href = '/organisation-list.html';
      }

      // Send a request to the server to get the organisation information
      fetch('/organisation/' + this.organisationID)
        .then(response => response.json())
        .then(data => {
          this.organisation = data;
        });

    },
    methods: {
      editOrganisation() {
        let xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
          if (xhttp.readyState === 4 && xhttp.status === 200) {
            // Redirect to /organisation-list after successful post
            window.location.href = '/organisation-list.html';
          } else if (xhttp.readyState === 4 && xhttp.status === 403){
            window.location.href = 'organisation-list.html';
            window.alert("Unauthorized Request");
            return;
          }
        }.bind(this);

        xhttp.open("POST", "/admin/editOrganisation", true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify({
          id: this.organisationID,
          name: this.organisation.name,
          address_line: this.organisation.address_line,
          suburb: this.organisation.suburb,
          state: this.organisation.state,
          postcode: this.organisation.postcode,
          statement: this.organisation.statement
        }));
      }
  }});
var vueinst = new Vue({
    el: '#app',
    data: {
      event: {
        name: '',
        // ... define other properties
      }
    },
    created() {
      // Get the event ID from the URL
      var urlParams = new URLSearchParams(window.location.search);
      var eventId = urlParams.get('eventId');
      this.organisationId = urlParams.get('organisationId');

      // Check if there is a event ID in the URL (adding vs editing a event)
      if (eventId) {
        // Send a request to the server to get the event information
        fetch('/event/' + eventId)
          .then(response => response.json())
          .then(data => {
            this.event = data;
            this.event.datetime = this.event.datetime.slice(0, -8);
          });
      } else {
        // Initialize this.event with a new, empty event object
        this.event = {
          id: '',
          title: '',
          subtitle: '',
          content: '',
          address_line: '',
          suburb: '',
          state: '',
          postcode: '',
          datetime: '',
          public: 1,
          organisation_id: this.organisationId,
        };
      }
    },
    methods: {
      editEvent() {
        let xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function() {
          if (xhttp.readyState === 4 && xhttp.status === 200) {
            // Redirect to /organisation page after successful event
            window.location.href = '/organisations.html?id=' + this.organisationId;
          } else if (xhttp.readyState === 4 && xhttp.status === 403){
            window.location.href = window.location.href = '/organisations.html?id=' + this.organisationId;
            window.alert("Unauthorized Request");
            return;
          }
        }.bind(this);
        xhttp.open("POST", "/manager/editEvent", true);
        xhttp.setRequestHeader("Content-Type", "application/json");
        xhttp.send(JSON.stringify({
          id: this.event.id,
          title: this.event.title,
          subtitle: this.event.subtitle,
          content: this.event.content,
          address_line: this.event.address_line,
          suburb: this.event.suburb,
          state: this.event.state,
          postcode: this.event.postcode,
          datetime: this.event.datetime,
          public: this.event.public,
          organisation_id: this.organisationId
        }));
      },

      cancelRedirect() {
        window.location.href = '/organisations.html?id=' + this.organisationId;
      }
  }});
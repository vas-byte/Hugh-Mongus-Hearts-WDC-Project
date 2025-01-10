var vueinst = new Vue({
  el: '#app',
  data: {
    organisationName: '',
    organisationAddress: '',
    organisationSuburb: '',
    organisationState: '',
    organisationPostcode: '',
    organisationStatement: ''
  },

  methods: {
    addOrganisation() {
      let xhttp = new XMLHttpRequest();

      xhttp.onreadystatechange = function() {

        if (xhttp.readyState === 4 && xhttp.status === 200) {
          // Redirect to /organisation-list after successful post
          window.location.href = '/organisation-list.html';
          return;
        } else if (xhttp.readyState === 4 && xhttp.status === 403){
          window.location.href = 'organisation-list.html';
          window.alert("Unauthorized Request");
          return;
        }
      }.bind(this);

      xhttp.open("POST", "/admin/addOrganisation", true);
      xhttp.setRequestHeader("Content-Type", "application/json");
      xhttp.send(JSON.stringify({
        name: this.organisationName,
        address_line: this.organisationAddress,
        suburb: this.organisationSuburb,
        state: this.organisationState,
        postcode: this.organisationPostcode,
        statement: this.organisationStatement
      }));
    }
  }
});



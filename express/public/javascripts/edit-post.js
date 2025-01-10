var vueinst = new Vue({
  el: '#app',
  data: {
    organisationId: 0,
    post: {}
  },
  methods: {
    editPost() {
      let xhttp = new XMLHttpRequest();

      xhttp.onreadystatechange = function() {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
          // Redirect to /organisations page after successful post
          window.location.href = '/organisations.html?id=' + this.organisationId;
          return;
        } else if (xhttp.readyState === 4 && xhttp.status === 403){
          window.location.href = window.location.href = '/organisations.html?id=' + this.organisationId;
          window.alert("Unauthorized Request");
          return;
        }
      }.bind(this);

      xhttp.open("POST", "/manager/editPost", true);
      xhttp.setRequestHeader("Content-Type", "application/json");
      xhttp.send(JSON.stringify({
        id: this.post.id,
        title: this.post.title,
        content: this.post.content,
        is_private: this.post.is_private,
        organisation_id: this.organisationId,
      }));
    },
    cancelRedirect() {
      window.location.href = '/organisations.html?id=' + this.organisationId;
    }
  },
  created() {
    // Get the post ID from the URL
    var urlParams = new URLSearchParams(window.location.search);
    var postId = urlParams.get('postId');
    this.organisationId = urlParams.get('organisationId');

    // Check if there is a post ID in the URL (adding vs editing a post)
    if (postId) {
      // Send a request to the server to get the post information
      fetch('/post/' + postId)
        .then(response => response.json())
        .then(data => {
          this.post = data;
        });
    } else {
      // Initialize this.post with a new, empty post object
      this.post = {
        id: '',
        title: '',
        content: '',
        is_private: 1,
        organisation_id: this.organisationId
      };
    }
  }
});

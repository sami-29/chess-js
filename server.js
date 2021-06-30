var ably = new Ably.Realtime('V2n6DQ.PUZBCg:CdB-NPc1CEjiiRym');
ably.connection.on('connected', function() {
  alert("That was simple, you're now connected to Ably in realtime");
});
var channel = ably.channels.get('quickstart');
channel.subscribe('greeting', function(message) {
  alert("Received a greeting message in realtime: " + message.data);
});
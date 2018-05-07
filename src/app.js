import './app.scss';
import firebase from 'firebase';
import 'firebase/firestore';
import L from 'leaflet';
import Chart from 'chart.js';
import moment from 'moment';
import 'bootstrap';

document.addEventListener('DOMContentLoaded', function () {
  var config = {
    apiKey: "AIzaSyDTsjfwJsoAFG2xaTXquPjawyjpaypGHiU",
    authDomain: "project-hermes-6c5cb.firebaseapp.com",
    databaseURL: "https://project-hermes-6c5cb.firebaseio.com",
    projectId: "project-hermes-6c5cb",
    storageBucket: "project-hermes-6c5cb.appspot.com",
    messagingSenderId: "185837078935"
  };

  var app = firebase.initializeApp(config);
  var db = firebase.firestore();
  db.settings({timestampsInSnapshots: true});
  var table = document.getElementById('data');
  var mymap = L.map('mapid').setView([25.188872, -80.347362], 13);
  L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
  }).addTo(mymap);
  mymap.scrollWheelZoom.disable();
  var marker = L.marker([25.188872, -80.347362]).addTo(mymap);
  db.collection("hermes1").get().then((querySnapshot) => {
    let vals = [];
    let labes = [];
    querySnapshot.forEach((doc) => {
      let row = table.insertRow();
      vals.push(parseInt(doc.data().data));
      labes.push(moment.unix(doc.id).format("H:mm:ss"));
      row.insertCell(0).innerHTML = moment.unix(doc.id).format("dddd, MMMM Do YYYY, h:mm:ss a");
      row.insertCell(1).innerHTML = doc.data().data;
    });
    console.log(labes);
    var ctx = document.getElementById("myChart").getContext('2d');
    var mychart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labes,
        datasets: [{
          label: 'Data',
          data: vals,
          fill: false,
          borderColor: "#3e95cd",
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  });
});

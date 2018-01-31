socket.on("setup", function(data) {
  console.log(data)

  _(data.openchannels).times(i => {
    var wrapper = document.createElement("div")
    wrapper.classList.add("reading-display")
    wrapper.id = "reading" + i
    _(3).times(i => {
      var dp = document.createElement("div")
      dp.classList.add("data-point")
      wrapper.append(dp)
    })
    document.querySelector("body").append(wrapper)
  })
})


socket.on("reading", function(data) {

  var box = document.querySelector(".reading-display#reading" + data.chnum)
  box.children[0].innerHTML = "raw: <span class='value'>" + data.reading.rawValue + "</span>"
  box.children[1].innerHTML = "0-1: <span class='value'>" + data.reading.value + "</span>"
  box.children[2].innerHTML = "cal: <span class='value'>" + data.calibrated + "</span>"

  if (data.calibrated < 0.5) {
    console.log("happening")
    box.setAttribute("style","background-color: rgba(255,0,0,"+ (1-data.calibrated) + ")")
  }
  else box.setAttribute("style","background-color: rgba(255,255,255," + data.calibrated + ")")
  // console.log(reading)
})

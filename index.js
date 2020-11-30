let cheerio = require("cheerio")
let axios = require("axios")
let jsonframe = require("jsonframe-cheerio")

let logsurl =
  "https://cors-anywhere.herokuapp.com/classic.warcraftlogs.com/guild/attendance-table/496740/0/0?page=1"

let mages = [
  "Sheldrake",
  "Diemage",
  "Dhrall",
  "Frizzeh",
  "Islossning",
  "Jahru",
  "Khelostras",
  "Mandula",
  "Pjukz",
]
function fetchHtml(url) {
  let responseCache = localStorage.getItem("scraped-" + url)
  return responseCache
    ? new Promise((resolve) => {
        resolve(cheerio.load(responseCache))
      })
    : axios.get(url).then((data) => {
        localStorage.setItem("scraped-" + url, data.data)
        return cheerio.load(data.data)
      })
}
let mageList = []
let logList = []
fetchHtml(logsurl).then(($) => {
  let head = $("#attendance-table thead tr th")
  let date = $("#attendance-table thead tr script")
  head.splice(0, 2)
  head.each(function (i, e) {
    let dateT = date[i].children[0].data
    let reg = /new Date\((.*)\)/g
    logList[i] = {
      zone: e.children[0].children[0].data.replace("\n", ""),
      date: new Date(parseInt(reg.exec(dateT)[1])),
    }
  })
  $("#attendance-table tbody tr td.Mage").each(function (index, element) {
    cheerio(element.children).each(function (childindex, childelement) {
      let mageName = childelement.data.replace("\n", "")
      if (childelement.type == "text" && mages.includes(mageName)) {
        mageList[mageName] = {}
        element.parentNode.children.splice(0, 2)
        mageList[mageName].attendance = []
        cheerio(element.parentNode.children).each(function (i, el) {
          mageList[mageName].attendance[i] =
            el.attribs.class == "present" ? true : false
        })
      }
    })
  })
  console.log(mageList, logList)
})

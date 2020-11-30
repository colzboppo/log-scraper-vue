<template>
  <div class="attendance">
    <h2>Attendance</h2>
    <table>
      <thead>
        <tr>
          <th></th>
          <th>% DKP</th>
          <th>% total</th>
          <th
            :key="i"
            v-for="(entry, i) in logs"
            class="logs"
            :class="{ dkp: entry.zone.dkp }"
          >
            <abbr :title="entry.date">{{ entry.zone.name }}</abbr>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr :key="i" v-for="(player, name, i) in mages" class="players">
          <td class="name">{{ name }}</td>
          <td class="attend">{{ player.dkp_attend }}</td>
          <td class="attend">{{ player.total_attend }}</td>
          <td
            :key="a"
            v-for="(attendance, a) in player.attendance"
            class="raid"
            :class="{
              attended: attendance,
              dkp: logs[a].zone.dkp,
              benched: player.bench[a],
            }"
          >
            <a
              v-if="!attendance && logs[a].zone.dkp && player.bench[a]"
              v-on:click="bench(name, a)"
              title="reset"
              href="#"
              >benched</a
            >
            <span v-else-if="attendance">present</span>
            <a
              v-else-if="!attendance && logs[a].zone.dkp && !player.bench[a]"
              v-on:click="bench(name, a)"
              title="bench"
              href="#"
              >absent</a
            >
            <span v-else>absent</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<style lang="scss">
:root {
  background: black;
}
.attendance {
  color: #aaa;
  .logs {
    min-width: 80px;
    opacity: 0.5;
    &.dkp {
      opacity: 1;
    }
  }
  .players {
    .name {
      font-weight: bold;
      text-align: right;
    }
    .raid {
      opacity: 0.5;
      &.dkp {
        opacity: 1;
      }
      &.attended {
        color: green;
      }
    }
  }
}
</style>
<script>
const cheerio = require("cheerio")
const axios = require("axios")
export default {
  data() {
    return {
      logsurl:
        "https://cors-anywhere.herokuapp.com/classic.warcraftlogs.com/guild/attendance-table/496740/0/0?page=1",
      mages: {
        Sheldrake: {
          bench: [],
          attendance: [],
          total_attend: null,
          dkp_attend: null,
        },
        Diemage: {
          bench: [],
          attendance: [],
          total_attend: null,
          dkp_attend: null,
        },
        Dhrall: {
          bench: [],
          attendance: [],
          total_attend: null,
          dkp_attend: null,
        },
        Frizzeh: {
          bench: [],
          attendance: [],
          total_attend: null,
          dkp_attend: null,
        },
        Islossning: {
          bench: [],
          attendance: [],
          total_attend: null,
          dkp_attend: null,
        },
        Jahru: {
          bench: [],
          attendance: [],
          total_attend: null,
          dkp_attend: null,
        },
        Khelostras: {
          bench: [],
          attendance: [],
          total_attend: null,
          dkp_attend: null,
        },
        Mandula: {
          bench: [],
          attendance: [],
          total_attend: null,
          dkp_attend: null,
        },
        Pjukz: {
          bench: [],
          attendance: [],
          total_attend: null,
          dkp_attend: null,
        },
        Skræv: {
          bench: [],
          attendance: [],
          total_attend: null,
          dkp_attend: null,
        },
      },
      zones: {
        Tem: { name: "Temple of Ahn Qiraj", dkp: true },
        Bla: { name: "Blackwing Lair", dkp: true },
        Rui: { name: "Ruins of Ahn Qiraj", dkp: false },
        Zul: { name: "Zul Gurub", dkp: false },
        Mol: { name: "Molten Core", dkp: false },
        Nax: { name: "Naxxrammas", dkp: true },
      },
      logs: [],
    }
  },
  methods: {
    fetchHtml(url) {
      let responseCache = localStorage.getItem("scraped-" + url)
      return responseCache
        ? new Promise((resolve) => {
            resolve(cheerio.load(responseCache))
          })
        : axios.get(url).then((data) => {
            localStorage.setItem("scraped-" + url, data.data)
            return cheerio.load(data.data)
          })
    },
    bench(mage, benchraid) {
      if (typeof this.mages[mage] != "undefined") {
        this.mages[mage].bench[benchraid] = !this.mages[mage].bench[benchraid]
        console.log(
          "benching",
          mage,
          benchraid,
          this.mages[mage].bench[benchraid]
        )
      }
    },
    countOccurrences(arr, val) {
      arr.reduce((a, v) => (v === val ? a + 1 : a), 0)
      return arr
    },
  },
  computed: {
    isBenched() {
      return true
    },
  },
  watch: {
    mages: function(newVal, oldVal) {
      console.log("mages changed!", newVal, oldVal)
    },
  },
  mounted() {
    let that = this
    const countOccurrences = (arr, val) =>
      arr.reduce((a, v) => (v === val ? a + 1 : a), 0)
    this.fetchHtml(this.logsurl).then(($) => {
      let head = $("#attendance-table thead tr th")
      let date = $("#attendance-table thead tr script")
      head.splice(0, 2)
      head.each(function(i, e) {
        let dateT = date[i].children[0].data
        let reg = /new Date\((.*)\)/g
        that.logs[i] = {
          zone: that.zones[e.children[0].children[0].data.replace("\n", "")],
          date: new Date(parseInt(reg.exec(dateT)[1])),
        }
      })

      $("#attendance-table tbody tr td.Mage").each(function(index, element) {
        cheerio(element.children).each(function(childindex, childelement) {
          let mageName = childelement.data.replace("\n", "")
          if (childelement.type == "text" && that.mages[mageName]) {
            let mage = that.mages[mageName]
            element.parentNode.children.splice(0, 2)

            cheerio(element.parentNode.children).each(function(i, el) {
              mage.attendance[i] = el.attribs.class == "present" ? true : false
              mage.bench[i] = false
            })

            let mage_attendance = countOccurrences([...mage.attendance], true)
            mage.total_attend = Math.round(
              (mage_attendance / mage.attendance.length) * 100
            )
            mage.dkp_attendance = []
            for (var i = 0; i < mage.attendance.length; i++) {
              if (that.logs[i].zone.dkp === true) {
                mage.dkp_attendance[i] = mage.attendance[i]
              }
            }
            mage.dkp_attendance = mage.dkp_attendance.filter((value) => {
              return typeof value != "undefined"
            })
            let dkp_attendance = countOccurrences(
              [...mage.dkp_attendance],
              true
            )
            mage.dkp_attend = Math.round(
              (dkp_attendance / mage.dkp_attendance.length) * 100
            )
            console.log(mageName, that.mages[mageName])
          }
        })
      })
    })
  },
}
</script>

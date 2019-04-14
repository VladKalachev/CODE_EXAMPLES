<template>
  <a-layout id="components-layout-demo-custom-trigger">
    <a-layout-sider :trigger="null" collapsible v-model="collapsed">
      <!-- Logo -->
      <!-- Menu -->
      <Menu></Menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0">
        <a-icon
          class="trigger"
          :type="collapsed ? 'menu-unfold' : 'menu-fold'"
          @click="()=> collapsed = !collapsed"
        />
      </a-layout-header>
      <a-layout-content
        :style="{ margin: '24px 16px', padding: '24px', background: '#fff', minHeight: '280px' }"
      >
        <!-- CARD -->
        <a-row>
          <a-col :span="12">
            <div>
              <h2 class="b-title b-left">{{ name }}</h2>
              <br>
              <span class="b-left">Найдено — {{ data.length }}</span>
            </div>
          </a-col>
          <a-col :span="12" class="b-rith">
            <ModalCreate v-bind:modal="form"></ModalCreate>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24">
            <br>
            <div>
              <a-table
                :columns="columns"
                :rowKey="(record, i) => record.key"
                :dataSource="data"
                :pagination="pagination"
                :loading="loading"
                @change="handleTableChange"
              >
                <router-link
                  :to="`/card/${record.nick}`"
                  slot="nameData"
                  slot-scope="text, record"
                >{{record.name}}</router-link>
                <div slot="deletedData" slot-scope="text, record">
                  <div v-if="record.deleted == '0'">
                    <a-tag color="#108ee9">Используется</a-tag>
                  </div>
                  <div v-else>
                    <a-tag color="#f50">Удален</a-tag>
                  </div>
                </div>
                <div slot="hierarchyDictData" slot-scope="text, record">
                  <div v-if="record.hierarchyDict == '0'">
                    <a-tag color="#999">Линейный</a-tag>
                  </div>
                  <div v-else>
                    <a-tag color="#87d068">Иерархический</a-tag>
                  </div>
                </div>
                <ModalEdit
                  slot="editField"
                  slot-scope="text, record"
                  v-bind:modal="form"
                  v-bind:field="record"
                ></ModalEdit>
                <template slot="name" slot-scope="name">{{name.first}} {{name.last}}</template>
              </a-table>
            </div>
          </a-col>
        </a-row>
        <!-- END CARD -->
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script>
import Menu from "./Menu";
import ModalCreate from "./Modals/ModalCreate";
import ModalEdit from "./Modals/ModalEdit";
import { close, closeSync } from "fs";
import axios from "axios";
import _ from "ramda";
const columns1 = [
  {
    title: "Код",
    dataIndex: "nick",
    sorter: true,
    width: "20%"
  },
  {
    title: "Наименование",
    dataIndex: "name",
    sorter: true,
    width: "20%",
    scopedSlots: { customRender: "nameData" }
  },
  {
    title: "Система",
    dataIndex: "sysName",
    sorter: true,
    width: "10%"
  },
  {
    title: "Статус",
    sorter: true,
    dataIndex: "deleted", // 1 удален , 0 используется
    filters: [
      { text: "Удален", value: "1" },
      { text: "Используется", value: "0" }
    ],
    scopedSlots: { customRender: "deletedData" },
    width: "10%"
  },
  {
    title: "Тип",
    sorter: true,
    dataIndex: "hierarchyDict", // 1 Иерархический ,  0 Линейный
    filters: [
      { text: "Иерархический", value: "1" },
      { text: "Линейный", value: "0" }
    ],
    scopedSlots: { customRender: "hierarchyDictData" },
    width: "10%"
  },
  {
    title: "Примечание",
    dataIndex: "note",
    width: "10%"
  },
  {
    title: "",
    dataIndex: "edit",
    scopedSlots: { customRender: "editField" },
    width: "5%"
  }
];
export default {
  name: "Card",
  components: {
    Menu,
    ModalCreate,
    ModalEdit
  },
  data() {
    return {
      data: [],
      pagination: { pageSize: 10 },
      pageData: {},
      loading: false,
      name: "",
      filteredInfo: null,
      sortedInfo: null,
      columns: [],
      collapsed: false,
      form: [],
      // modal
      visible: false,
      url: {
        dict: "http://localhost:3000/nsi?nick="
      }
    };
  },
  mounted() {
    this.getRoute();
  },
  computed: { 
  },
  methods: {
    handleTableChange(pagination, filters, sorter) {
      this.filteredInfo = filters;
      this.sortedInfo = sorter;
      this.getRoute();
    },
    getRoute() {
      const url = this.$router.currentRoute;
      this.loading = true;
      axios
        .get(this.url.dict +`${url.params.name}`)
        .then(data => {
          console.log("data", data);
          this.pageData = data.data[0];
          this.name = data.data[0].name;
          this.loading = false;
          this.creatColumns(this.pageData);
          this.creatData(this.pageData);
        });
    },
    creatColumns(arr) {
      let { sortedInfo, filteredInfo, filterStatys } = this;
      sortedInfo = sortedInfo || {};
      filteredInfo = filteredInfo || {};
      filterStatys = filterStatys || false;
      this.form = arr;
      let metaAttributes = arr.metaAttributes;
      this.columns = metaAttributes.map(item => {
        if (item["nick"] == "name") {
          return { title: item["name"], dataIndex: item["nick"], sorter: true };
        }
        return { title: item["name"], dataIndex: item["nick"] };
      });
      this.columns.push(
        { title: "Порядок", sorter: true, dataIndex: "sortValue" },
        {
          title: "Статус",
          sorter: true,
          dataIndex: "deleted", // 1 удален , 0 используется
          filters: [
            { text: "Удален", value: "1" },
            { text: "Используется", value: "0" }
          ],
          scopedSlots: { customRender: "deletedData" },
          filteredValue: filteredInfo.deleted || ["0"],
          onFilter: (value, record) => {
            return record.deleted === parseInt(value);
          },
          width: "10%"
        },
        {
          title: "",
          dataIndex: "edit",
          scopedSlots: { customRender: "editField" },
          width: "5%"
        }
      );
    },
    generateTable(arr) {
      // set children
      let data = [...arr];
      let a = [];
      data.map((item, i) => {
        if (item.parentId === null) {
          console.log("parents", item.Name, item.id, i);
          data.forEach(it => {
            if (it.parentId !== null) {
              console.log("children", it.Name, it.parentId);
              if (item.id === it.parentId) {
                item.children = [{ ...it }];
              }
            }
          });
        }
      });
    },
    creatData(arr) {
      let results = {};
      const elements = arr.elements;
      this.data = elements.map(item => {
        let arrField = [];
        let ar = item.values.map(it => {
          let name = it["nick"];
          let ob = {};
          let resault = {};
          if (it["nick"] == "group") {
            arrField.push(it["valueAttr"]);
            ob["group"] = arrField;
          } else {
            ob[name] = it["valueAttr"];
          }
          return ob;
        });
        results = Object.assign({}, ...ar, {
          key: item["id"],
          id: item["id"],
          sortValue: item["sortValue"],
          deleted: item["deleted"],
          dateCreate: item["dateCreate"],
          dateDeleted: item["dateDeleted"],
          note: item["note"],
          parentId: item["parentId"]
        });
        return results;
      });
      let data = [...this.data];
      const nest = (items, id = null, link = "parentId") =>
        items
          .filter(item => item[link] === id)
          .map(item => {
            let a = { ...item };
            a.children = nest(items, item.id);
            if (a.children.length == 0) {
              delete a.children;
            }
            return a;
          });
      this.data = nest(data);
    }
  }
};
</script>

<style>
#components-layout-demo-custom-trigger .trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
  float: left;
}
#components-layout-demo-custom-trigger .trigger:hover {
  color: #1890ff;
}
#components-layout-demo-custom-trigger .logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px;
}
.b-left {
  text-align: left;
  display: inherit;
}
.b-rith {
  text-align: right;
  display: inherit;
}
.ant-table-tbody a {
  cursor: pointer;
}
</style>
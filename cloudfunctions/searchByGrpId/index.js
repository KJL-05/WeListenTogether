// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
  var grpId= event.groupId
  var res= await db.collection("dbListenTogether").where({
    groupId: grpId
  }).get()
  return res;
}
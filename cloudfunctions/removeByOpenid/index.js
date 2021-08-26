// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db=cloud.database();
// 云函数入口函数
exports.main = async (event, context) => {
  var res=await db.collection("dbListenTogether").where({
    _openid:event.openId
  }).remove()
  return res
}
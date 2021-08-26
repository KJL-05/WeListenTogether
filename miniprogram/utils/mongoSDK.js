import mongoRequest from '../utils/mongoRequest'

export async function addData(data){
  var dataInfo=await mongoRequest('/addData',{data});
  return dataInfo;
}

export async function delData(_openid){
  var dataInfo=await mongoRequest('/delData',{
    _openid
  });
  return dataInfo;
}

export async function updateData(data){
  var dataInfo= await mongoRequest('/updateData',data);
  return dataInfo;
}

export async function getData(data){
  var dataInfo= await mongoRequest('/getData',{data});
  return dataInfo;
}

export async function postFeedback(data){
  var dataInfo=await mongoRequest('/feedback',{data});
  return dataInfo;
}

export async function getGroupList(){
  var dataInfo=await mongoRequest('/getGroupList');
  return dataInfo;
}

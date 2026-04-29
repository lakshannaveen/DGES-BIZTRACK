import axios from "axios";

const getBannerImages = async () => {
  return axios.get(`home/GetBannerImgList`).then((response) => {
    return response;
  });
};

const GetAccessHeadComponent = async () => {
  return axios.post(`Access/DGESGetAccessHeadComponent`).then((response) => {
    return response;
  });
};

const GetUserByServiceNo = async () => {
 
  
  return axios.post(`login/DGESGetUserByServiceNo`)
    .then((response) => {

      if (
        response.data &&
        response.data.ResultSet &&
        response.data.ResultSet.length > 0
      ) {
        const serviceNo = response.data.ResultSet[0].ServiceNo;

        localStorage.setItem("ServiceNo", serviceNo);
      }

      return response;
    });
};


export default {
  getBannerImages,
  GetAccessHeadComponent,
  GetUserByServiceNo,
};

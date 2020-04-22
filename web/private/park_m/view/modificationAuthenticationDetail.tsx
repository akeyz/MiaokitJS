import * as React from "react";
import "css!./styles/roomPattern.css"
import DataService from "dataService";


interface IProps {
  history: any,
  location: any
}

interface IState {
  file: string,
  name: string
}

export default class modificationAuthenticationDetail extends React.Component<{ history: any }>{
  public readonly props: Readonly<IProps> = {
    history: this.props.history,
    location: this.props.location
  }

  public readonly state: Readonly<IState> = {
    file: "",
    name: JSON.parse(sessionStorage.getItem("roomInfo"))[0].part[0].name
  }

  componentDidMount() {
  }

  public dataService: DataService = new DataService()

  upload(file) {
    this.dataService.upload(this.callBackUpload.bind(this), file)
  }

  callBackUpload(data) {
    console.log(data)
  }

  change(event) {
    this.setState({ name: event.target.value })
  }

  // ����
  goBack() {
    this.props.history.goBack()
  }

  // �ύ
  submit(event) {
    let formFile = new FormData();
    formFile.append("uploadFile", event.target.files[0]); //�����ļ�����
    console.log(formFile)
    this.upload(formFile)
  }

  render() {
    return (
      <div className="rent-room" style={{ backgroundColor: "#F2F2F2" }}>
        <div className="rent-room-back">
          <div style={{ float: "left", width: "100%" }} onClick={this.goBack.bind(this)}>
            <img src="./park_m/image/back.png" style={{ margin: "-10px 10px 0 0" }} />
            <span>�������޸�</span>
          </div>
        </div>
        <div style={{ backgroundColor: "#ffffff", width: "100%", height: "90%", marginTop: "15px" }}>
          <div style={{ width: "100%", height: "160px", lineHeight: "160px", fontSize: "40px", paddingLeft: "50px" }}>
            <div className="enterprise-information-star"></div>
            <div style={{ color: "#949494", height: "80px", float: "left", marginRight: "30px", marginTop: "-16px" }}>������ƣ�</div>
          </div>
          <div style={{ height: "120px", margin: "0 50px 0 50px", fontSize: "40px" }} >
            <input value={this.state.name} onChange={this.change.bind(this)}
              style={{ backgroundColor: "#F2F2F2", width: "100%", margin: "auto", height: "120px", lineHeight: "120px", border: "none", outline: "none", color: "#333333", paddingLeft: "50px" }} />
          </div>
          <div style={{ fontSize: "40px", color: "#6C6C6C", margin: "100px 50px 0 50px", height: "500px" }}>
            <div style={{ float: "left", width: "50%" }}>
              <div>����ͼ:</div>
              <div style={{ width: "250px", height: "250px", marginTop: "50px" }}>
                <img src="./park_m/image/close.png" style={{ position: "relative", left: "210px", top: "10px" }} />
                <input type="file" onChange={this.submit.bind(this)} />
                <img src="./park_m/image/tx.jpg" width="100%" height="100%" />
              </div>
            </div>
            <div style={{ float: "left", width: "50%" }}>
              <div>ȫ��ͼ:</div>
              <div style={{ width: "250px", height: "250px", marginTop: "50px" }}>
                <img src="./park_m/image/close.png" style={{ position: "relative", left: "210px", top: "10px" }} />
                <img src="./park_m/image/tx.jpg" width="100%" height="100%" />
              </div>
            </div>
          </div>
        </div>
        <div className="rent-room-detail-bottom">
          <div style={{ float: "left", width: "50%", height: "100%", textAlign: "center", lineHeight: "130px", color: "#6C6C6C", backgroundColor: "#F2F2F2" }}>ȡ��</div>
          <div style={{ float: "left", width: "50%", height: "100%", textAlign: "center", lineHeight: "130px", backgroundColor: "#0B8BF0", color: "#ffffff" }} onClick={this.submit.bind(this)}>�ύ</div>
        </div>
      </div>
    )
  }
}
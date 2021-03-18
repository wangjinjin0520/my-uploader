<template>
  <div>
    <div>
      <input type="file" @change="handleFileChange"/>
      <el-button @click="handleUpload">上传</el-button>
    </div>
    <!--    <div>-->
    <!--      <el-upload-->
    <!--        class="upload-demo"-->
    <!--        ref="upload"-->
    <!--        action=""-->
    <!--        :file-list="fileList"-->
    <!--        :on-change="handleFileChange"-->
    <!--        :auto-upload="false">-->
    <!--        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>-->
    <!--        <el-button style="margin-left: 10px;" size="small" type="success" @click="handleUpload">上传到服务器</el-button>-->
    <!--        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>-->
    <!--      </el-upload>-->
    <!--    </div>-->
  </div>

</template>

<script>
import {Button, Input} from 'element-ui';
// const SIZE = 10 * 1024 * 1024;   //10M
const SIZE = 10 * 1024;   //10k
const Status = {
  wait: "wait",
  pause: "pause",
  uploading: "uploading"
};

export default {
  name: "Uploader",
  data() {
    return {
      container: {
        file: null
      },
      fileFragments: [],  //fileFragments,
      fileList: []
    }
  },
  components: {
    Button,
    Input
  },
  methods: {
    handleFileChange(e) {
      const [file] = e.target.files;
      if (!file) return;
      // Object.assign(this.$data, this.$options.data());
      this.container.file = file;
    },
    //todo:点击上传按钮后开始准备上传
    async handleUpload() {
      console.log('------------- 开始手动处理文件上传 -------------')
      if (!this.container.file) return;
      // this.status = Status.uploading;
      //获取文件切片列表data
      const fileChunkList = this.createFileChunk(this.container.file);
      this.fileFragments = fileChunkList.map(({file}, index) => ({
        chunk: file,
        hash: this.container.file.name + "-" + index
      }));
      await this.uploadChunks();
    },
    //todo:异步上传切片
    async uploadChunks() {
      console.log('------------- 异步上传切片 -------------')
      const requestList = this.fileFragments
        .map(({chunk, hash}) => {
          const formData = new FormData();
          formData.append("chunk", chunk);
          formData.append("hash", hash);
          formData.append("fileName", this.container.file.name);
          return {formData}
        })//将每一个切片都包装成一个formData
        .map((({formData}) => {
          return this.$axios({
            url:"http://localhost:3000",
            data:formData
          })
        })) //每一个切片都返回一个Promise
      //todo:第一步合并了上传了所有的切片
      await Promise.all(requestList).then(()=>{
        console.log('------------- 切片全部上传完成 -------------')
      }); // 并发上传所有的切片
      //todo:第二步通知服务端合并切片
      await this.mergeFileFragments();
    },
    //todo:通知服务端合并切片
    async mergeFileFragments(){
      await this.$axios({
        url: "http://localhost:3000/merge",
        header:{
          "content-type":"application/json"
        },
        data:JSON.stringify(({
          filename:this.container.file.name
        }))
      })
    },
    //todo:获取文件片段
    createFileChunk(file, size = SIZE) {
      console.log('------------- 文件切片 -------------')
      const fileChunkList = [];
      let cur = 0;
      //将文件按照SIZE切分成片段
      while (cur < file.size) {
        fileChunkList.push({file: file.slice(cur, cur + size)});
        cur += size;
      }
      return fileChunkList;
    },
  }
}
</script>

<style scoped>

</style>

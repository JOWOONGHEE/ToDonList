import mongoose from 'mongoose';

// 사용자 스키마 정의
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, '이메일은 필수입니다.'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value}는 유효한 이메일 주소가 아닙니다.`
    }
  },
  password: {
    type: String,
    required: [true, '비밀번호는 필수입니다.'],
    minlength: 6,
    trim: true
  }
}, {
  timestamps: true // 생성 및 업데이트 시간 기록
});

// User 모델 생성
const User = mongoose.model('User', userSchema);

export default User;
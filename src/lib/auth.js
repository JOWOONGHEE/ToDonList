import bcrypt from 'bcryptjs';

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10); // 솔트 생성, 10은 솔트의 라운드 수
  const hashedPassword = await bcrypt.hash(password, salt); // 비밀번호 해싱
  return hashedPassword;
};

export { hashPassword };
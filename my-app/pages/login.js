import React from 'react';

export default function Login() {
  return (
    <div>
      <h1>로그인 페이지</h1>
      <p>로그인을 위해 아래 정보를 입력해주세요.</p>
      <form>
        <label htmlFor="username">사용자 이름:</label>
        <input type="text" id="username" name="username" />
        <label htmlFor="password">비밀번호:</label>
        <input type="password" id="password" name="password" />
        <button type="submit">로그인</button>
      </form>
    </div>
  );
}



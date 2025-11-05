import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

const PUBLIC_URL = process.env.PUBLIC_URL || "";
const HERO_BG = PUBLIC_URL + "/img/default/hero-login.png";
const USERNAME_ICON = PUBLIC_URL + "/img/auth/username-icon.svg";
const PASSWORD_ICON = PUBLIC_URL + "/img/auth/password-icon.svg";

const Login: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="bg-white w-full h-screen min-h-[700px] flex relative overflow-hidden">
      <div className="flex-1 flex h-full justify-center items-center bg-white z-10 px-6">
        <div className="w-[403px] flex flex-col items-stretch gap-10">
          <h1 className="relative w-fit [font-family:'Poppins-SemiBold',Helvetica] font-semibold text-[#171725] text-3xl text-center tracking-[0.10px] leading-[normal]">
            로그인
          </h1>

          <form className="inline-flex flex-col h-[270px] items-start relative" onSubmit={handleSubmit}>
            <div className="inline-flex flex-col items-end gap-8 relative flex-[0_0_auto]">
              <div className="inline-flex flex-col items-start gap-4 relative flex-[0_0_auto]">
                <div className="flex flex-col items-center gap-6 relative self-stretch w-full flex-[0_0_auto]">
                  <div className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
                    <label className="flex items-center gap-4 pt-[var(--space-component-padding-medium)] pr-[var(--space-component-padding-xlarge)] pb-[var(--space-component-padding-medium)] pl-[var(--space-component-padding-xlarge)] relative self-stretch w-full flex-[0_0_auto] mt-[-0.80px] ml-[-0.80px] mr-[-0.80px] bg-white rounded-lg border-[1.6px] border-solid border-[#e0e2e9]">
                      <div className="relative w-[21.5px] h-[17.2px]" aria-hidden="true">
                        <img className="absolute w-full h-full top-0 left-0" alt="" src={USERNAME_ICON} />
                      </div>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="아이디"
                        className="mt-[-0.80px] [font-family:'Poppins-Medium',Helvetica] font-medium text-[#9699b7] text-sm leading-[normal] relative w-fit tracking-[0.10px] flex-1 bg-transparent border-0 outline-none"
                        aria-label="아이디"
                        required
                      />
                    </label>

                    <label className="flex items-center gap-4 pt-[var(--space-component-padding-medium)] pr-[var(--space-component-padding-xlarge)] pb-[var(--space-component-padding-medium)] pl-[var(--space-component-padding-xlarge)] relative self-stretch w-full flex-[0_0_auto] mb-[-0.80px] ml-[-0.80px] mr-[-0.80px] bg-white rounded-lg border-[1.6px] border-solid border-[#e0e2e9]">
                      <div className="relative w-[19px] h-[19px]" aria-hidden="true">
                        <div className="absolute inset-[-6.06%]">
                          <img className="absolute w-full h-full top-0 left-0" alt="password" src={PASSWORD_ICON} />
                        </div>
                      </div>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="비밀번호"
                        className="mt-[-0.80px] [font-family:'Poppins-Medium',Helvetica] font-medium text-[#9699b7] text-sm leading-[normal] relative w-fit tracking-[0.10px] flex-1 bg-transparent border-0 outline-none"
                        aria-label="비밀번호"
                        required
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2.5 pt-[var(--space-component-padding-medium)] pr-[var(--space-component-padding-6xlarge)] pb-[var(--space-component-padding-medium)] pl-[var(--space-component-padding-6xlarge)] relative self-stretch w-full flex-[0_0_auto] mb-[-0.80px] ml-[-0.80px] mr-[-0.80px] bg-[#0062ff] rounded-lg cursor-pointer hover:bg-[#0052d9] transition-colors"
                  >
                    <span className="mt-[-0.80px] [font-family:'Poppins-SemiBold',Helvetica] font-semibold text-white text-[15px] text-center leading-[normal] relative w-fit tracking-[0.10px]">
                      Log In
                    </span>
                  </button>
                </div>

                <div className="flex w-[403px] items-center justify-end gap-2.5 relative flex-[0_0_auto]">
                  <button
                    type="button"
                    className="mt-[-1.00px] [font-family:'Poppins-SemiBold',Helvetica] font-semibold text-[#0062ff] text-[15px] text-center leading-6 whitespace-nowrap relative w-fit tracking-[0.10px] hover:underline bg-transparent border-0 p-0 cursor-pointer"
                  >
                    비밀번호를 잊으셨나요?
                  </button>
                </div>
              </div>

              <div className="relative w-[401px] h-[12px]" />
            </div>

            <div className="inline-flex items-start gap-2 relative flex-[0_0_auto]">
              <div className="mt-[-1.00px] [font-family:'Poppins-Regular',Helvetica] font-normal text-[#969ab8] text-[15px] text-center leading-6 whitespace-nowrap relative w-fit tracking-[0.10px]">
                아직 계정을 생성하지 않으셨나요?
              </div>
              <Link
                to="/signup"
                className="mt-[-1.00px] [font-family:'Poppins-SemiBold',Helvetica] font-semibold text-[#0062ff] text-[15px] text-center leading-6 whitespace-nowrap relative w-fit tracking-[0.10px] hover:underline"
              >
                회원가입
              </Link>
            </div>
          </form>
        </div>
      </div>

      <div className="relative flex-shrink-0">
        <img className="h-full w-auto object-cover" alt="Rectangle" src={HERO_BG} />
      </div>

      <div className="absolute bottom-[71.22%] left-1/2 right-[8.66%] top-[12.73%] z-20">
        <div className="flex flex-col items-end absolute bottom-0 left-[4.48%] right-0 top-[21.32%]">
          <p className="[font-family:'Poppins-SemiBold',Helvetica] font-normal text-[#3a424a] text-[32px] tracking-[-0.64px] leading-[44px] relative min-w-full w-[min-content]">
            <span className="font-semibold text-[#3062d4] tracking-[-0.20px]">다시 입어</span>
            <span className="[font-family:'Poppins-Regular',Helvetica] text-[#3a424a] tracking-[-0.20px]">
              , 패스트 패션 사회를 끝내고{" "}
            </span>
            <span className="font-semibold text-[#3062d4] tracking-[-0.20px]">미래</span>
            <span className="[font-family:'Poppins-Regular',Helvetica] text-[#3a424a] tracking-[-0.20px]">
              가 있는{" "}
            </span>
            <span className="font-semibold text-[#3062d4] tracking-[-0.20px]">오늘</span>
            <span className="[font-family:'Poppins-Regular',Helvetica] text-[#3a424a] tracking-[-0.20px]">
              을 만듭니다
            </span>
          </p>

          <div className="inline-flex items-center justify-center gap-2.5 relative flex-[0_0_auto]">
            <div className="w-fit [font-family:'Poppins-Medium',Helvetica] font-medium text-[#3a424a] text-2xl tracking-[-0.48px] leading-9 whitespace-nowrap relative mt-[-1.00px]">
              - 다시입다연구소
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

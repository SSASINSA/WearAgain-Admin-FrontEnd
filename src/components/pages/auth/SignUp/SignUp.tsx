import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./SignUp.css";

const PUBLIC_URL = process.env.PUBLIC_URL || "";
const HERO_BG = PUBLIC_URL + "/img/auth/signup-hero-bg.png";
const USERNAME_ICON = PUBLIC_URL + "/img/auth/username-icon.svg";
const PASSWORD_ICON = PUBLIC_URL + "/img/auth/password-icon.svg";

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    email: "",
    description: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="bg-white w-full h-screen min-h-[700px] grid relative overflow-x-auto" style={{ gridTemplateColumns: 'minmax(0, 1fr) 560px', minWidth: '1280px' }}>
      <img className="absolute inset-y-0 left-0 h-full w-auto object-cover" alt="Rectangle" src={HERO_BG} />

      <div className="absolute w-[41.34%] h-[16.05%] top-[12.73%] left-[8.27%]">
        <div className="flex flex-col w-[95.52%] h-[78.68%] items-end absolute top-[21.32%] left-[4.48%]">
          <p className="self-stretch [font-family:'Poppins-SemiBold',Helvetica] font-normal text-transparent text-[32px] tracking-[-0.64px] leading-[44px] relative mt-[-1.00px]">
            <span className="font-semibold text-[#3062d4] tracking-[-0.20px]">당신</span>
            <span className="[font-family:'Poppins-Regular',Helvetica] text-[#3a424a] tracking-[-0.20px]">
              이{" "}
            </span>
            <span className="font-semibold text-[#3062d4] tracking-[-0.20px]">다시 입을 때</span>
            <span className="[font-family:'Poppins-Regular',Helvetica] text-[#3a424a] tracking-[-0.20px]">
              까지{" "}
            </span>
            <span className="font-semibold text-[#3062d4] tracking-[-0.20px]">연구</span>
            <span className="[font-family:'Poppins-Regular',Helvetica] text-[#3a424a] tracking-[-0.20px]">
              합니다
            </span>
          </p>
          <div className="inline-flex items-center justify-center gap-2.5 relative flex-[0_0_auto]">
            <div className="w-fit [font-family:'Poppins-Medium',Helvetica] font-medium text-[#3a424a] text-2xl tracking-[-0.48px] leading-9 whitespace-nowrap relative mt-[-1.00px]">
              - 다시입다연구소
            </div>
          </div>
        </div>
      </div>

      <div className="col-start-2 flex h-full justify-center bg-white z-10" style={{ minWidth: '560px' }}>
        <div className="my-auto w-[403px] flex flex-col items-stretch gap-10">
          <h1 className="relative w-fit [font-family:'Poppins-SemiBold',Helvetica] font-semibold text-[#171725] text-3xl text-center tracking-[0.10px] leading-[normal]">
            회원가입
          </h1>

          <form className="flex flex-col items-start w-full relative" onSubmit={handleSubmit}>
            <div className="flex flex-col items-end gap-8 relative w-full">
              <div className="flex flex-col items-start gap-4 relative w-full">
                <div className="flex flex-col items-center gap-6 relative self-stretch w-full flex-[0_0_auto]">
                  <div className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
                    <label className="flex items-center gap-4 pt-[var(--space-component-padding-medium)] pr-[var(--space-component-padding-xlarge)] pb-[var(--space-component-padding-medium)] pl-[var(--space-component-padding-xlarge)] relative self-stretch w-full flex-[0_0_auto] mt-[-0.80px] ml-[-0.80px] mr-[-0.80px] bg-white rounded-lg border-[1.6px] border-solid border-[#e0e2e9]">
                      <div className="relative w-[21.5px] h-[17.2px]" aria-hidden="true">
                        <img className="absolute w-full h-full top-0 left-0" alt="" src={USERNAME_ICON} />
                      </div>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="아이디"
                        className="mt-[-0.80px] [font-family:'Poppins-Medium',Helvetica] font-medium text-[#9699b7] text-sm leading-[normal] relative flex-1 min-w-0 bg-transparent border-0 outline-none tracking-[0.10px]"
                        aria-label="아이디"
                        required
                      />
                    </label>

                    <label className="flex items-center gap-4 pt-[var(--space-component-padding-medium)] pr-[var(--space-component-padding-xlarge)] pb-[var(--space-component-padding-medium)] pl-[var(--space-component-padding-xlarge)] relative self-stretch w-full flex-[0_0_auto] ml-[-0.80px] mr-[-0.80px] bg-white rounded-lg border-[1.6px] border-solid border-[#e0e2e9]">
                      <div className="relative w-[19px] h-[19px]" aria-hidden="true">
                        <div className="absolute inset-[-6.06%]">
                          <img className="absolute w-full h-full top-0 left-0" alt="password" src={PASSWORD_ICON} />
                        </div>
                      </div>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="비밀번호"
                        className="mt-[-0.80px] [font-family:'Poppins-Medium',Helvetica] font-medium text-[#9699b7] text-sm leading-[normal] relative flex-1 min-w-0 bg-transparent border-0 outline-none tracking-[0.10px]"
                        aria-label="비밀번호"
                        required
                      />
                    </label>

                    <label className="flex items-center gap-4 pt-[var(--space-component-padding-medium)] pr-[var(--space-component-padding-xlarge)] pb-[var(--space-component-padding-medium)] pl-[var(--space-component-padding-xlarge)] relative self-stretch w-full flex-[0_0_auto] ml-[-0.80px] mr-[-0.80px] bg-white rounded-lg border-[1.6px] border-solid border-[#e0e2e9]">
                      <div className="relative w-[19px] h-[19px]" aria-hidden="true">
                        <div className="absolute inset-[-6.06%]">
                          <img className="absolute w-full h-full top-0 left-0" alt="password" src={PASSWORD_ICON} />
                        </div>
                      </div>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="비밀번호 재입력"
                        className="mt-[-0.80px] [font-family:'Poppins-Medium',Helvetica] font-medium text-[#9699b7] text-sm leading-[normal] relative flex-1 min-w-0 bg-transparent border-0 outline-none tracking-[0.10px]"
                        aria-label="비밀번호 재입력"
                        required
                      />
                    </label>

                    <label className="flex items-center gap-4 pt-[var(--space-component-padding-medium)] pr-[var(--space-component-padding-xlarge)] pb-[var(--space-component-padding-medium)] pl-[var(--space-component-padding-xlarge)] relative self-stretch w-full flex-[0_0_auto] ml-[-0.80px] mr-[-0.80px] bg-white rounded-lg border-[1.6px] border-solid border-[#e0e2e9]">
                      <div className="relative w-[21.5px] h-[17.2px]" aria-hidden="true">
                        <img className="absolute w-full h-full top-0 left-0" alt="" src={USERNAME_ICON} />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="이메일"
                        className="mt-[-0.80px] [font-family:'Poppins-Medium',Helvetica] font-medium text-[#9699b7] text-sm leading-[normal] relative flex-1 min-w-0 bg-transparent border-0 outline-none tracking-[0.10px]"
                        aria-label="이메일"
                        required
                      />
                    </label>

                    <div className="flex flex-col items-start gap-2 pt-[var(--space-component-padding-medium)] pr-[var(--space-component-padding-xlarge)] pb-[var(--space-component-padding-medium)] pl-[var(--space-component-padding-xlarge)] relative self-stretch w-full flex-[0_0_auto] mb-[-0.80px] ml-[-0.80px] mr-[-0.80px] bg-white rounded-lg border-[1.6px] border-solid border-[#e0e2e9]">
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="상세 설명"
                        rows={4}
                        className="[font-family:'Poppins-Medium',Helvetica] font-medium text-[#9699b7] text-sm leading-[normal] relative self-stretch w-full min-h-[80px] bg-transparent border-0 outline-none tracking-[0.10px] resize-none"
                        aria-label="상세 설명"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2.5 pt-[var(--space-component-padding-medium)] pr-[var(--space-component-padding-6xlarge)] pb-[var(--space-component-padding-medium)] pl-[var(--space-component-padding-6xlarge)] relative self-stretch w-full flex-[0_0_auto] mb-[-0.80px] ml-[-0.80px] mr-[-0.80px] bg-[#0062ff] rounded-lg cursor-pointer hover:bg-[#0052d9] transition-colors"
                  >
                    <span className="mt-[-0.80px] [font-family:'Poppins-SemiBold',Helvetica] font-semibold text-white text-[15px] text-center leading-[normal] relative w-fit tracking-[0.10px]">
                      회원가입
                    </span>
                  </button>
                </div>
              </div>

              <div className="relative w-[401px] h-[21px]" />
            </div>

            <div className="inline-flex items-start gap-2 relative flex-[0_0_auto] mt-[-52px]">
              <div className="mt-[-1.00px] [font-family:'Poppins-Regular',Helvetica] font-normal text-[#969ab8] text-[15px] text-center leading-6 whitespace-nowrap relative w-fit tracking-[0.10px]">
                이미 계정이 있으신가요?
              </div>
              <Link
                to="/login"
                className="mt-[-1.00px] [font-family:'Poppins-SemiBold',Helvetica] font-semibold text-[#0062ff] text-[15px] text-center leading-6 whitespace-nowrap relative w-fit tracking-[0.10px] hover:underline"
              >
                로그인
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

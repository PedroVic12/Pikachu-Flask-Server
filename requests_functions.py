import requests


link = "https://script.googleusercontent.com/macros/echo?user_content_key=CFHZJqgVuHxS6M2T6Kenmf1_qZMcb8yzHChDym_UnO_XD1xJ_ePgGLXqpo35uNGUQ8NHYZmDSiXUkjeyUFnbH27hNZVAvanam5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnAOQyAu3J0pgt2VCGulS5w8imbI838rlwibGFXE33fHTu2oJiqw6U5ivl46C-t8zfz_w-5UDalqjAlt85is3_lIFYLQzr2ZuXtz9Jw9Md8uu&lib=MpFR3aDjpNEEl3D_WuvT0p5ryw3v7gu6W"

response = requests.get("https://script.googleusercontent.com/macros/echo?user_content_key=_SbuJavmd8GVa5YuIJlezZ4QYaN-GcR7bgY_QIDNm6t5r_EcUDnEaVTWfiApWREAEGOZGmcz5OoxM69_vBbD9zd8yalm620Jm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnAOQyAu3J0pgt2VCGulS5w8imbI838rlwibGFXE33fHTu2oJiqw6U5ivl46C-t8zfz_w-5UDalqjAlt85is3_lIFYLQzr2ZuXtz9Jw9Md8uu&lib=MpFR3aDjpNEEl3D_WuvT0p5ryw3v7gu6W")
print("### REQUEST ###")
print(response)

# Check if the response is JSON
try:
    data = response.json()
except ValueError:
    # Log non-JSON response for debugging
    print("Non-JSON response received:")
    print(response.text)
    exit(1)

print("### DATA ###")
print(data)

result = response.json()

print("### RESULTADO ###")
print(result)
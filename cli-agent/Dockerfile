FROM node:18-bookworm

WORKDIR /app

COPY scan.js .
COPY agent_decide.js .
COPY final_report.js .
COPY rules.json .
COPY package.json .

RUN mkdir /output

CMD ["sh", "-c", "node scan.js && node agent_decide.js && node final_report.js"]
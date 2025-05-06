To recreate a new upgraded version of backstage
cd .devcontainer
docker build -t create_backstage_workspace .
docker run -it --mount type=bind,src=./workspace,dst=/workspace create_backstage_workspace bash
> npx @backstage/create-app@latest
> > y
> > backstage
> chmod -R 777 backstage
> exit

diff -qr workspace/backstage ../src/backstage


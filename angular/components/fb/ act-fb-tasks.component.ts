import { Component, OnInit, Input, ViewChild } from "@angular/core";
import {
  ActiveTaskService,
  ActivityResourceService,
  ITask
} from "@reinform-cdp/bpm-components";
import { TabsetComponent } from "ngx-bootstrap";
import { differenceWith, isEqual, assignIn } from "lodash";
import { StateService, Transition } from "@uirouter/core";
import { ToastrService } from "ngx-toastr";
import { from } from "rxjs";
import { delay } from "rxjs/internal/operators";
import { ObjectsService } from "../../../services/objects.service";

@Component({
  selector: "app-act-fb-tasks",
  templateUrl: "./act-fb-tasks.component.html",
  styleUrls: ["./act-fb-tasks.component.scss"]
})
export class ActFbTasksComponent implements OnInit {
  @ViewChild("staticTabs") staticTabs: TabsetComponent;

  isLoading: boolean;
  finishing = false;
  task: ITask;

  //taskData
  public documentId: any;

  //getData
  public dataPassport: any;
  public dataMaterialCapital: any;
  public dataDeclarant: any;
  public dataContactPerson: any;
  //folder data
  public folderGUID: string;
  public oldReferenceFiles: any[];
  public referenceFiles: any[];
  public newReferenceFiles: any[];
  public formKey: string;

  public theBoundCallback: Function;

  constructor(
    private ativityResourceService: ActivityResourceService,
    private activeTaskService: ActiveTaskService,
    private stateService: StateService,
    private toastrService: ToastrService,
    private objectService: ObjectsService,
    private transition: Transition
  ) {
    this.referenceFiles = [];
    this.finishing = false;
  }

  ngOnInit() {
    this.isLoading = true;
    this.activeTaskService
      .getTask()
      .pipe(delay(500))
      .subscribe(task => {
        this.task = task;
        this.documentId = task.variables.filter(
          item => item.name === "EntityIdVar"
        )[0].value;
        this.formKey = task.formKey;
        this.getActMatCap();
      });
  }

  getActMatCap() {
    this.objectService.getActMatCapital(this.documentId).subscribe(res => {
      this.dataMaterialCapital = res;
      this.getAllData();
      this.isLoading = false;
    });
  }

  getAllData() {
    const {
      maternalCapital: { objId, contactPerson, declarant, folderGUID }
    } = this.dataMaterialCapital;

    this.folderGUID = this.dataMaterialCapital.maternalCapital.folderGUID;

    objId
      ? this.objectService.getObject(objId).subscribe(res => {
          this.dataPassport = res;
        })
      : null;

    contactPerson.id
      ? this.objectService.getCardFz(contactPerson.id).subscribe(res => {
          this.dataContactPerson = res;
        })
      : null;
    declarant.id
      ? this.objectService.getCardFz(declarant.id).subscribe(res => {
          this.dataDeclarant = res;
        })
      : null;
    folderGUID
      ? this.objectService
          .getItemsInFolder(folderGUID, "rin")
          .subscribe(res => {
            this.referenceFiles = res.files
              ? res.files.map(item => {
                  this._transformFiles(item);
                })
              : [];
            this.oldReferenceFiles = res.files
              ? res.files.map(item => this._transformFiles(item))
              : [];
            this.newReferenceFiles = assignIn(
              this.referenceFiles,
              this.oldReferenceFiles
            );
          })
      : null;
  }

  checkFiles = () => {
    console.log(this.referenceFiles);
  };

  selectTab = (tabId: number) => {
    this.staticTabs.tabs[tabId].active = true;
  };

  onSubmit = () => {
    console.clear();
    console.log(`referenceFiles`, this.referenceFiles);
    console.log(`oldReferenceFiles`, this.oldReferenceFiles);
    console.log(`newReferenceFiles`, this.newReferenceFiles);
    const res = differenceWith(
      this.oldReferenceFiles,
      this.newReferenceFiles,
      isEqual
    );
    console.log(res);
  };

  _transformFiles = item => {
    return {
      idFile: item.fileId,
      mimeType: item.contentType,
      nameFile: item.fileName,
      sizeFile: item.contentLength,
      dateFile: item.fileDate
    };
  };

  finishTask() {
    this.finishing = true;
    from(this.ativityResourceService.finishTask(<any>this.task.id)).subscribe(
      () => {
        this.toastrService.success("Задача успешно завершена");
        from([0])
          .pipe(delay(1000))
          .subscribe(() => {
            this.finishing = false;
            this.stateService.go("app.user-tasks");
          });
      },
      err => {
        console.log(err);
        this.toastrService.error(
          err.data.exception,
          "При завершении задачи произошла ошибка"
        );
        this.finishing = false;
      }
    );
  }
}

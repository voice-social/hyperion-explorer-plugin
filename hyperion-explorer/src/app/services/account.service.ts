import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {AccountCreationData, GetAccountResponse} from '../interfaces';
import {default as HyperionStreamClient, IncomingData} from '@eosrio/hyperion-stream-client';
import {MatTableDataSource} from '@angular/material/table';
import {PaginationService} from './pagination.service';
import {SA2JSON} from '../utils/sa2json';
const sa2json = new SA2JSON();

interface HealthResponse {
  features: {
    streaming: {
      deltas: boolean;
      enable: boolean;
      traces: boolean;
    }
  };
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  getAccountUrl: string;
  getActionsUrl: string;
  getCreatorUrl: string;
  getTxUrl: string;
  getBlockUrl: string;
  getKeyUrl: string;
  jsonData: any;
  account: any = {
    cpu_limit: {
      used: 1,
      max: 1
    },
    net_limit: {
      used: 1,
      max: 1
    }
  };
  actions: any[] = [];
  tokens: any[] = [];
  public tableDataSource: MatTableDataSource<any[]>;
  streamClient: HyperionStreamClient;
  public streamClientStatus = false;
  public libNum: any;
  private server: string;
  private verificationLoop: any;
  private predictionLoop: any;
  private pendingSet = new Set();
  public loaded = false;
  public streamClientLoaded = false;

  constructor(private httpClient: HttpClient, private pagService: PaginationService) {
    this.getServerUrl();
    this.getAccountUrl = environment.hyperionApiUrl + '/v2/state/get_account?account=';
    this.getActionsUrl = environment.hyperionApiUrl + '/v2/history/get_actions?account=';
    this.getCreatorUrl = environment.hyperionApiUrl + '/v2/history/get_creator?account=';
    this.getTxUrl = environment.hyperionApiUrl + '/v2/history/get_transaction?id=';
    this.getBlockUrl = environment.hyperionApiUrl + '/v1/trace_api/get_block';
    this.getKeyUrl = environment.hyperionApiUrl + '/v2/state/get_key_accounts?public_key=';
    this.tableDataSource = new MatTableDataSource([]);
    // this.initStreamClient().catch(console.log);
  }

  async monitorLib(): Promise<void> {
    console.log('Starting LIB monitoring...');

    if (!this.verificationLoop) {
      this.verificationLoop = setInterval(async () => {
        await this.updateLib();
      }, 21 * 12 * 500);
    }

    if (!this.predictionLoop) {
      this.predictionLoop = setInterval(() => {
        this.libNum += 12;
        if (this.pendingSet.size > 0) {
          this.pendingSet.forEach(async (value) => {
            if (value < this.libNum) {
              console.log(`Block cleared ${value} < ${this.libNum}`);
              this.pendingSet.delete(value);
            }
          });
        } else {
          console.log('No more pending actions, clearing loops');
          this.clearLoops();
        }
      }, 12 * 500);
    }

  }

  async checkIrreversibility(): Promise<void> {
    this.libNum = await this.checkLib();
    if (this.libNum) {
      let counter = 0;
      for (const action of this.actions) {
        if (action.block_num <= this.libNum) {
          action.irreversible = true;
        } else {
          counter++;
          this.pendingSet.add(action.block_num);
        }
      }
      if (counter > 0) {
        console.log('Pending actions: ' + counter);
        this.monitorLib().catch(console.log);
      }
    }
  }

  getServerUrl(): void {
    let server;
    if (environment.production) {
      server = window.location.origin;
    } else {
      server = environment.hyperionApiUrl;
    }
    this.server = server;
  }

  async updateLib(): Promise<void> {
    this.libNum = await this.checkLib();
  }

  async checkLib(): Promise<number> {
    try {
      const info = await this.httpClient.get(this.server + '/v1/chain/get_info').toPromise() as any;
      if (info) {
        return info.last_irreversible_block_num;
      } else {
        return null;
      }
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async initStreamClient(): Promise<void> {
    try {
      const health = await this.httpClient.get(this.server + '/v2/health').toPromise() as HealthResponse;
      if (health.features.streaming.enable) {
        this.streamClient = new HyperionStreamClient(this.server, {async: true});
        this.streamClientLoaded = true;
        this.streamClient.onConnect = () => {
          this.streamClientStatus = this.streamClient.online;
        };

        this.streamClient.onLIB = (data) => {
          this.libNum = data.block_num;
        };

        this.streamClient.onData = async (data: IncomingData, ack) => {
          if (data.type === 'action') {
            this.actions.unshift(data.content);
            if (this.actions.length > 20) {
              this.actions.pop();
            }
            this.tableDataSource.data = this.actions;
          }
          ack();
        };
      } else {
        console.log('Streaming disabled!');
        this.streamClientLoaded = false;
      }
    } catch (e) {
      console.log(e);
    }
  }

  setupRequests(): void {
    // find latest block
    let maxBlock = 0;
    for (const action of this.actions) {
      if (action.block_num > maxBlock) {
        maxBlock = action.block_num;
      }
    }

    console.log(maxBlock);

    // setup request
    this.streamClient.onConnect = () => {
      this.streamClient.streamActions({
        account: this.account.account_name,
        action: '*',
        contract: '*',
        filters: [],
        read_until: 0,
        start_from: maxBlock + 1
      }).catch(console.log);
      this.streamClientStatus = this.streamClient.online;
    };
  }

  async convertData(actions): Promise<any> {
	for (var acti in actions) {
		let action = actions[acti];
		if (["simpleassets", "simplemarket"].includes(action.act.account)  ) {
			//console.log(this.actions[acti]);
			if (action.act.data.idata) actions[acti].act.data.idata = sa2json.buildJSON(actions[acti].act.data.idata);
			if (action.act.data.mdata) actions[acti].act.data.mdata = sa2json.buildJSON(actions[acti].act.data.mdata);
			if (action.act.data.ixdata) actions[acti].act.data.ixdata = sa2json.buildJSON(actions[acti].act.data.ixdata);
			if (action.act.data.mxdata) actions[acti].act.data.mxdata = sa2json.buildJSON(actions[acti].act.data.mxdata);							
			if (action.act.data.exdata) actions[acti].act.data.exdata = sa2json.buildJSON(actions[acti].act.data.exdata);
			
			if (action.act.data.idata_json) delete actions[acti].act.data.idata_json;
			if (action.act.data.mdata_json) delete actions[acti].act.data.mdata_json;
			if (action.act.data.ixdata_json) delete actions[acti].act.data.ixdata_json;
			if (action.act.data.mxdata_json) {
				actions[acti].act.data.mxdata = actions[acti].act.data.mxdata_json;
				delete actions[acti].act.data.mxdata_json;
			}
			if (action.act.data.exdata_json) delete actions[acti].act.data.exdata_json;
			if (action.act.data.mxdata_key) delete actions[acti].act.data.mxdata_key;
			if (action.act.data.mxdata_value) delete actions[acti].act.data.mxdata_value;
		}
	}
	return actions;
  }

  async loadAccountData(accountName: string): Promise<boolean> {
    this.loaded = false;
    try {
      this.jsonData = await this.httpClient.get(this.getAccountUrl + accountName).toPromise() as GetAccountResponse;
      if (this.jsonData.account) {
        this.account = this.jsonData.account;
      }

      if (this.jsonData.tokens) {
        this.tokens = this.jsonData.tokens;
      }

      if (this.jsonData.actions) {
        this.actions = await this.convertData(this.jsonData.actions);		
		this.checkIrreversibility().catch(console.log);
        this.tableDataSource.data = this.actions;
      }

      if (this.jsonData.total_actions) {
        this.pagService.totalItems = this.jsonData.total_actions;
      }

      this.loaded = true;
      return true;
    } catch (error) {
      console.log(error);
      this.jsonData = null;
      this.loaded = true;
      return false;
    }
  }

  async loadMoreActions(accountName: string): Promise<void> {
    const firstAction = this.actions[this.actions.length - 1];
    const maxGs = (firstAction.global_sequence - 1);
    try {
      const q = this.getActionsUrl + accountName + '&global_sequence=0-' + maxGs + '&limit=50';
      const results = await this.httpClient.get(q).toPromise() as any;
      if (results.actions && results.actions.length > 0) {
		let convertedActions = await this.convertData(results.actions);
        this.actions.push(...convertedActions);
        this.tableDataSource.data = this.actions;
      }
    } catch (e) {
      console.log(e);
    }
  }

  async loadTxData(txId: string): Promise<any> {
    this.loaded = false;
    try {
      const data = await this.httpClient.get(this.getTxUrl + txId).toPromise();
	  await this.convertData(data['actions']);
	  this.loaded = true;
      return data;
    } catch (error) {
      console.log(error);
      this.loaded = true;
      return null;
    }
  }

  async loadBlockData(blockNum: number): Promise<any> {
    this.loaded = false;
    try {
      const data = await this.httpClient.post(this.getBlockUrl, {
        block_num: blockNum
      }).toPromise();
      this.loaded = true;
      return data;
    } catch (error) {
      console.log(error);
      this.loaded = true;
      return null;
    }
  }

  async loadPubKey(key: string): Promise<any> {
    this.loaded = false;
    try {
      const data = await this.httpClient.get(this.getKeyUrl + key + '&details=true').toPromise();
      this.loaded = true;
      return data;
    } catch (error) {
      console.log(error);
      this.loaded = true;
      return null;
    }
  }

  async getCreator(accountName: string): Promise<AccountCreationData> {
    try {
      return await this.httpClient.get(this.getCreatorUrl + accountName).toPromise() as AccountCreationData;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  toggleStreaming(): void {
    if (this.streamClientStatus) {
      this.streamClient.disconnect();
      this.streamClientStatus = false;
      this.checkIrreversibility().catch(console.log);
    } else {
      this.tableDataSource.paginator.firstPage();
      this.clearLoops();
      this.setupRequests();
      this.streamClient.connect(() => {
        console.log('hyperion streaming client connected!');
      });
    }
  }

  clearLoops(): void {
    if (this.predictionLoop) {
      clearInterval(this.predictionLoop);
    }
    if (this.verificationLoop) {
      clearInterval(this.verificationLoop);
    }
  }

  disconnectStream(): void {
    if (this.streamClient && this.streamClientStatus) {
      this.streamClient.disconnect();
      this.streamClient.online = false;
      this.streamClientStatus = false;
    }
  }
}

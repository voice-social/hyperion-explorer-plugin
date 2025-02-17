import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AccountService} from '../../services/account.service';
import {faExchangeAlt} from '@fortawesome/free-solid-svg-icons/faExchangeAlt';
import {faCircle} from '@fortawesome/free-solid-svg-icons/faCircle';
import {faLock} from '@fortawesome/free-solid-svg-icons/faLock';
import {faHourglassStart} from '@fortawesome/free-solid-svg-icons/faHourglassStart';
import {faHistory} from '@fortawesome/free-solid-svg-icons/faHistory';
import {faSadTear} from '@fortawesome/free-solid-svg-icons/faSadTear';
import {faSpinner} from '@fortawesome/free-solid-svg-icons/faSpinner';
import {ChainService} from '../../services/chain.service';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit, OnDestroy {
  columnsToDisplay: string[] = ['contract', 'action', 'data', 'auth'];
  tx: any = {
    actions: null
  };
  faCircle = faCircle;
  faExchange = faExchangeAlt;
  faLock = faLock;
  faHourglass = faHourglassStart;
  faHistory = faHistory;
  faSadTear = faSadTear;
  faSpinner = faSpinner;
  txID: string;
  countdownLoop: any;
  countdownTimer = 0;

  objectKeyCount(obj): number {
    try {
      return Object.keys(obj).length;
    } catch (e) {
      return 0;
    }
  }

  constructor(private activatedRoute: ActivatedRoute,
              public accountService: AccountService,
              public chainData: ChainService,
              private title: Title) {
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(async (routeParams) => {
      this.txID = routeParams.transaction_id;
      this.tx = await this.accountService.loadTxData(routeParams.transaction_id);

      if (!this.chainData.chainInfoData.chain_name) {
        this.title.setTitle(`TX ${routeParams.transaction_id.slice(0, 8)} • Hyperion Explorer`);
      } else {
        this.title.setTitle(`TX ${routeParams.transaction_id.slice(0, 8)} • ${this.chainData.chainInfoData.chain_name} Hyperion Explorer`);
      }

      this.accountService.libNum = this.tx.lib;
      if (this.tx.actions[0].block_num > this.tx.lib) {
        await this.reloadCountdownTimer();
        this.countdownLoop = setInterval(async () => {
          this.countdownTimer--;
          if (this.countdownTimer <= 0) {
            await this.reloadCountdownTimer();
            if (this.accountService.libNum > this.tx.actions[0].block_num) {
              clearInterval(this.countdownLoop);
            }
          }
        }, 1000);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.countdownLoop) {
      clearInterval(this.countdownLoop);
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }

  stringifyObject(subitem: object): string {
    return JSON.stringify(subitem, null, 2);
  }

  async reloadCountdownTimer(): Promise<void> {
    await this.accountService.updateLib();
    this.countdownTimer = Math.ceil((this.tx.actions[0].block_num - this.accountService.libNum) / 2);
  }
  
  isArray(value: any): boolean {
    return value !== null && typeof value === 'object' && value.length > 0;
  }
  
  isJSON(item): boolean {
	if (typeof item == "object" ) 
		return true;
	try { 
		item = JSON.parse(item); 
	} catch (e) { 
		return false;  
	}
	if (typeof item === "object" && item !== null) { 
		return true;
	}
	return false;
  }
}

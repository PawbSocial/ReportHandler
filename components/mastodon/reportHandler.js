import { SendTelegramMessage } from "../telegram/index.js";

export const OnNewReport = async (json, env, ctx) => {
    const report_instance = json.domain;
    const report = json.object;
  
    if (report.action_taken) {
        return;
    }
  
    const reporter = report.account;
    const reported_user = report.target_account;
  
    const reported_statuses = report.statuses;
  
    const rule_category = report.category;
    const rules_broken = report.rules;
    const additional_info = report.comment;
  
    const isRemoteReport = reporter.username === reporter.domain;
  
    const reporterName = isRemoteReport ? `User from ${reporter.domain}` : `${reporter.username}@${reporter.domain || `${report_instance} [LOCAL]`}`;
    const reportedUserName = `${reported_user.username}@${reported_user.domain ? `${reported_user.domain}` : `${report_instance} [LOCAL]`}` 
  
    const rules = rules_broken
        .filter(r => r.text.startsWith("Rule #"))
        .map(r => r.text.split('–')[0].trim())
        .join(', ');
  
    const statuses = reported_statuses
        .map((rs, idx) => {
            const date = new Date(rs.created_at)
            .toString()
            .split('(')[0]
            .trim();
    
            if (idx === 5) {
            return `and ${reported_statuses.length - 5} more...`;
            } else if (idx > 5) {
            return '';
            }
    
            return `- Post #${idx + 1}: ${date}`;
        })
        .join('\n');
  
    const message = `⚠️ New Report #${report.id} for ${report_instance}

👤 Reporter: ${reporterName}
🗣 Reported User: ${reportedUserName}

⏩ Forwarded: ${isRemoteReport ? `🌐 Remote Report` : (report.forwarded ? '✅ Yes' : '❌ No')}

🛡 Report Category: ${rule_category}
⚖️ Rules Broken: ${isRemoteReport ? 'N/A (Remote Report)' : (rules.length > 0 ? rules : 'No rules selected by reporter')}

✍️ Additional Info: ${`\n${additional_info}` || 'N/A (No comment provided)'}

💬 Reported Posts: ${statuses.length > 0 ? `\n${statuses}` : 'N/A (No statuses attached to report)'}`;

    const report_url = `https://${report_instance}/admin/reports/${report.id}`;
    const reported_statuses_entities = reported_statuses.map(
        (rs, idx) => {
            if (idx >= 5) {
            return {};
            }
    
            const offset = message.indexOf(`Post #${idx + 1}`);
            const length = message.indexOf('\n', offset);
            
            return {
            type: "text_link",
            offset,
            length: (length !== -1 ? length : message.length) - offset,
            url: rs.url,
            };
        },
    );
  
    const options = {
        disable_web_page_preview: true,
        reply_markup: {
            inline_keyboard: [
                [
                    {
                    text: `View Report`,
                    url: report_url,
                    }
                ],
            ],
        },
        entities: [
            {
                type: "text_link",
                offset: message.indexOf("#"),
                length: report.id.length + 1,
                url: report_url,
            },
            ...reported_statuses_entities
                .filter(e => e.type),
        ]
    };
  
    await SendTelegramMessage(env, "mod", message, options);
};

export const OnUpdatedReport = async (json, env, ctx) => {
    const report_instance = json.domain;
    const report = json.object;

    if (!report.action_taken) {
        return;
    }

    const action_taken_time = new Date(report.action_taken_at).getTime();
    const fiveMinutesAgo = Date.now() - (300 * 1000);

    if (action_taken_time < fiveMinutesAgo) {
        // Old report update, or resolved a while ago
        return;
    }

    const actor = report.action_taken_by_account;
    const message = `✅ Report #${report.id} on ${report_instance} resolved by ${actor.username} (Thank you~ :3)`;
    const report_url = `https://${report_instance}/admin/reports/${report.id}`;
    const options = {
        disable_web_page_preview: true,
        reply_markup: {
        inline_keyboard: [
            [
            {
                text: `View Report`,
                url: report_url,
            }
            ],
        ],
        },
        entities: [
        {
            type: "text_link",
            offset: message.indexOf("#"),
            length: report.id.length + 1,
            url: report_url,
        }
        ]
    };

    await SendTelegramMessage(env, "mod", message, options);
};